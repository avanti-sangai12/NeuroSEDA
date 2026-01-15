// Background service worker for NeuroSEDA Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('NeuroSEDA extension installed');
});

// Ensure service worker stays active
chrome.runtime.onStartup.addListener(() => {
  console.log('NeuroSEDA extension started');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getBehavioralData') {
    handleBehavioralDataRequest(request, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'getHistoryInsights') {
    handleHistoryInsightsRequest(request, sendResponse);
    return true;
  }
  
  if (request.action === 'getSearchPatterns') {
    handleSearchPatternsRequest(request, sendResponse);
    return true;
  }
  
  if (request.action === 'getPopupData') {
    handlePopupDataRequest(request, sendResponse);
    return true;
  }
  
  if (request.action === 'ping') {
    // Simple test endpoint to verify service worker is working
    sendResponse({ success: true, message: 'Service worker is active' });
    return true;
  }
});

async function handleBehavioralDataRequest(request, sendResponse) {
  try {
    const { timeRange = 24 } = request; // hours
    
    const endTime = Date.now();
    const startTime = endTime - (timeRange * 60 * 60 * 1000);
    
    // Get browsing history
    const historyItems = await chrome.history.search({
      text: '',
      startTime: startTime,
      endTime: endTime,
      maxResults: 1000
    });
    
    // Get active tabs for current context
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Analyze behavioral patterns
    const behavioralData = analyzeBehavioralPatterns(historyItems, tabs);
    
    sendResponse({
      success: true,
      data: behavioralData
    });
  } catch (error) {
    console.error('Error getting behavioral data:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

async function handleHistoryInsightsRequest(request, sendResponse) {
  try {
    const { hours = 24 } = request;
    
    const endTime = Date.now();
    const startTime = endTime - (hours * 60 * 60 * 1000);
    
    const historyItems = await chrome.history.search({
      text: '',
      startTime: startTime,
      endTime: endTime,
      maxResults: 2000
    });
    
    const insights = generateHistoryInsights(historyItems);
    
    sendResponse({
      success: true,
      insights: insights
    });
  } catch (error) {
    console.error('Error getting history insights:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

async function handleSearchPatternsRequest(request, sendResponse) {
  try {
    const { days = 7 } = request;
    
    const endTime = Date.now();
    const startTime = endTime - (days * 24 * 60 * 60 * 1000);
    
    const historyItems = await chrome.history.search({
      text: '',
      startTime: startTime,
      endTime: endTime,
      maxResults: 1000
    });
    
    const searchPatterns = extractSearchPatterns(historyItems);
    
    sendResponse({
      success: true,
      patterns: searchPatterns
    });
  } catch (error) {
    console.error('Error getting search patterns:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

function analyzeBehavioralPatterns(historyItems, tabs) {
  const patterns = {
    productivity: 0,
    research: 0,
    social: 0,
    shopping: 0,
    news: 0,
    general: 0
  };
  
  const domainCategories = {
    productivity: ['github.com', 'notion.so', 'trello.com', 'asana.com', 'slack.com', 'teams.microsoft.com'],
    research: ['google.com', 'stackoverflow.com', 'wikipedia.org', 'reddit.com', 'quora.com'],
    social: ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com'],
    shopping: ['amazon.com', 'ebay.com', 'etsy.com', 'shopify.com'],
    news: ['cnn.com', 'bbc.com', 'reuters.com', 'techcrunch.com', 'theverge.com']
  };
  
  historyItems.forEach(item => {
    const domain = extractDomain(item.url);
    const category = categorizeDomain(domain, domainCategories);
    patterns[category]++;
  });
  
  // Add current tab context
  if (tabs.length > 0) {
    const currentDomain = extractDomain(tabs[0].url);
    const currentCategory = categorizeDomain(currentDomain, domainCategories);
    patterns.currentContext = {
      domain: currentDomain,
      category: currentCategory,
      title: tabs[0].title,
      url: tabs[0].url
    };
  }
  
  return {
    patterns,
    totalVisits: historyItems.length,
    uniqueDomains: new Set(historyItems.map(item => extractDomain(item.url))).size,
    timeDistribution: analyzeTimeDistribution(historyItems)
  };
}

function generateHistoryInsights(historyItems) {
  const insights = {
    topDomains: {},
    searchQueries: [],
    timePatterns: {},
    categoryBreakdown: {},
    productivityScore: 0
  };
  
  // Domain analysis
  const domainStats = {};
  historyItems.forEach(item => {
    const domain = extractDomain(item.url);
    if (!domainStats[domain]) {
      domainStats[domain] = { visits: 0, lastVisit: 0, category: 'general' };
    }
    domainStats[domain].visits += item.visitCount || 1;
    domainStats[domain].lastVisit = Math.max(domainStats[domain].lastVisit, item.lastVisitTime);
  });
  
  // Sort domains by visit count
  insights.topDomains = Object.entries(domainStats)
    .sort(([,a], [,b]) => b.visits - a.visits)
    .slice(0, 10)
    .map(([domain, stats]) => ({ domain, ...stats }));
  
  // Search query analysis
  historyItems.forEach(item => {
    if (isSearchQuery(item.url)) {
      const query = extractSearchQuery(item.url);
      if (query) {
        insights.searchQueries.push({
          query,
          timestamp: item.lastVisitTime,
          domain: extractDomain(item.url)
        });
      }
    }
  });
  
  // Time pattern analysis
  insights.timePatterns = analyzeTimeDistribution(historyItems);
  
  // Category breakdown
  insights.categoryBreakdown = analyzeCategoryBreakdown(historyItems);
  
  // Productivity score
  insights.productivityScore = calculateProductivityScore(historyItems);
  
  return insights;
}

function extractSearchPatterns(historyItems) {
  const patterns = {
    searchEngines: {},
    commonQueries: {},
    searchCategories: {},
    searchFrequency: {}
  };
  
  historyItems.forEach(item => {
    if (isSearchQuery(item.url)) {
      const query = extractSearchQuery(item.url);
      const engine = getSearchEngine(item.url);
      const category = categorizeDomain(extractDomain(item.url));
      
      if (query) {
        // Common queries
        patterns.commonQueries[query] = (patterns.commonQueries[query] || 0) + 1;
        
        // Search engines
        patterns.searchEngines[engine] = (patterns.searchEngines[engine] || 0) + 1;
        
        // Search categories
        patterns.searchCategories[category] = (patterns.searchCategories[category] || 0) + 1;
      }
    }
  });
  
  return patterns;
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url.split('/')[0] || url;
  }
}

function categorizeDomain(domain, domainCategories) {
  for (const [category, domains] of Object.entries(domainCategories)) {
    if (domains.some(d => domain.includes(d) || d.includes(domain))) {
      return category;
    }
  }
  return 'general';
}

function isSearchQuery(url) {
  const searchIndicators = ['search', 'q=', 'query=', 's=', 'search?'];
  return searchIndicators.some(indicator => url.toLowerCase().includes(indicator));
}

function extractSearchQuery(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('q') || 
           urlObj.searchParams.get('query') || 
           urlObj.searchParams.get('s');
  } catch {
    return null;
  }
}

function getSearchEngine(url) {
  if (url.includes('google.com')) return 'Google';
  if (url.includes('bing.com')) return 'Bing';
  if (url.includes('yahoo.com')) return 'Yahoo';
  if (url.includes('duckduckgo.com')) return 'DuckDuckGo';
  if (url.includes('youtube.com')) return 'YouTube';
  return 'Other';
}

function analyzeTimeDistribution(historyItems) {
  const timeSlots = {
    morning: 0,    // 6-12
    afternoon: 0,  // 12-18
    evening: 0,    // 18-22
    night: 0       // 22-6
  };
  
  historyItems.forEach(item => {
    const hour = new Date(item.lastVisitTime).getHours();
    if (hour >= 6 && hour < 12) timeSlots.morning++;
    else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
    else if (hour >= 18 && hour < 22) timeSlots.evening++;
    else timeSlots.night++;
  });
  
  return timeSlots;
}

function analyzeCategoryBreakdown(historyItems) {
  const categories = {};
  const domainCategories = {
    productivity: ['github.com', 'notion.so', 'trello.com', 'asana.com'],
    research: ['google.com', 'stackoverflow.com', 'wikipedia.org'],
    social: ['facebook.com', 'twitter.com', 'linkedin.com', 'youtube.com'],
    shopping: ['amazon.com', 'ebay.com', 'etsy.com'],
    news: ['cnn.com', 'bbc.com', 'techcrunch.com']
  };
  
  historyItems.forEach(item => {
    const domain = extractDomain(item.url);
    const category = categorizeDomain(domain, domainCategories);
    categories[category] = (categories[category] || 0) + 1;
  });
  
  return categories;
}

function calculateProductivityScore(historyItems) {
  const productivityDomains = ['github.com', 'notion.so', 'trello.com', 'asana.com', 'slack.com'];
  const productivityVisits = historyItems.filter(item => 
    productivityDomains.some(domain => item.url.includes(domain))
  ).length;
  
  return historyItems.length > 0 ? (productivityVisits / historyItems.length) * 100 : 0;
}

// Handle tab updates for real-time context
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    // Send updated context to content script
    chrome.tabs.sendMessage(tabId, {
      action: 'tabUpdated',
      data: {
        url: tab.url,
        title: tab.title,
        domain: extractDomain(tab.url)
      }
    }).catch(() => {
      // Content script might not be ready yet
    });
  }
});

// Handle tab activation for context switching
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      // Update current context
      chrome.storage.local.set({
        currentContext: {
          domain: extractDomain(tab.url),
          url: tab.url,
          title: tab.title,
          timestamp: Date.now()
        }
      });
    }
  } catch (error) {
    console.error('Error handling tab activation:', error);
  }
});

// Handle popup data requests
async function handlePopupDataRequest(request, sendResponse) {
  try {
    // Get basic metrics for popup
    const [historyItems, tabs] = await Promise.all([
      chrome.history.search({
        text: '',
        startTime: Date.now() - (24 * 60 * 60 * 1000), // Last 24 hours
        maxResults: 1000
      }),
      chrome.tabs.query({ active: true, currentWindow: true })
    ]);
    
    const popupData = {
      pageCount: historyItems.length,
      dataPoints: historyItems.length * 5, // Estimate data points
      lastUpdate: new Date().toLocaleTimeString()
    };
    
    sendResponse({
      success: true,
      data: popupData
    });
  } catch (error) {
    console.error('Error getting popup data:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}
