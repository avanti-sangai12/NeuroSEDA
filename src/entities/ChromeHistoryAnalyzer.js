export class ChromeHistoryAnalyzer {
  constructor() {
    this.historyCache = new Map();
    this.searchPatterns = new Map();
    this.domainCategories = new Map();
    this.initializeDomainCategories();
  }

  initializeDomainCategories() {
    // Pre-defined domain categories for better context
    this.domainCategories.set('productivity', [
      'notion.so', 'trello.com', 'asana.com', 'slack.com', 'teams.microsoft.com',
      'docs.google.com', 'office.com', 'github.com', 'gitlab.com', 'bitbucket.org'
    ]);
    
    this.domainCategories.set('research', [
      'google.com', 'bing.com', 'wikipedia.org', 'stackoverflow.com', 'reddit.com',
      'quora.com', 'medium.com', 'dev.to', 'hackernews.com', 'arxiv.org'
    ]);
    
    this.domainCategories.set('social', [
      'facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com',
      'tiktok.com', 'discord.com', 'telegram.org', 'whatsapp.com'
    ]);
    
    this.domainCategories.set('shopping', [
      'amazon.com', 'ebay.com', 'etsy.com', 'shopify.com', 'walmart.com',
      'target.com', 'bestbuy.com', 'newegg.com'
    ]);
    
    this.domainCategories.set('news', [
      'cnn.com', 'bbc.com', 'reuters.com', 'nytimes.com', 'wsj.com',
      'techcrunch.com', 'theverge.com', 'wired.com', 'arstechnica.com'
    ]);
  }

  async getRecentHistory(limit = 100) {
    try {
      // Check if Chrome History API is available
      if (!chrome?.history) {
        console.warn('Chrome History API not available, using mock data');
        return this.getMockHistoryData(limit);
      }

      const endTime = Date.now();
      const startTime = endTime - (24 * 60 * 60 * 1000); // Last 24 hours

      const historyItems = await chrome.history.search({
        text: '',
        startTime: startTime,
        endTime: endTime,
        maxResults: limit
      });

      return this.processHistoryItems(historyItems);
    } catch (error) {
      console.error('Error fetching Chrome history:', error);
      return this.getMockHistoryData(limit);
    }
  }

  async getSearchHistory(limit = 50) {
    try {
      if (!chrome?.history) {
        return this.getMockSearchData(limit);
      }

      const endTime = Date.now();
      const startTime = endTime - (7 * 24 * 60 * 60 * 1000); // Last 7 days

      const historyItems = await chrome.history.search({
        text: '',
        startTime: startTime,
        endTime: endTime,
        maxResults: limit * 2 // Get more to filter for searches
      });

      // Filter for search queries (URLs containing search parameters)
      const searchItems = historyItems.filter(item => 
        this.isSearchQuery(item.url) || 
        item.url.includes('search') || 
        item.url.includes('q=') ||
        item.url.includes('query=')
      );

      return this.processSearchItems(searchItems.slice(0, limit));
    } catch (error) {
      console.error('Error fetching search history:', error);
      return this.getMockSearchData(limit);
    }
  }

  async getDomainAnalysis(hours = 24) {
    try {
      if (!chrome?.history) {
        return this.getMockDomainAnalysis(hours);
      }

      const endTime = Date.now();
      const startTime = endTime - (hours * 60 * 60 * 1000);

      const historyItems = await chrome.history.search({
        text: '',
        startTime: startTime,
        endTime: endTime,
        maxResults: 1000
      });

      return this.analyzeDomainPatterns(historyItems);
    } catch (error) {
      console.error('Error analyzing domains:', error);
      return this.getMockDomainAnalysis(hours);
    }
  }

  processHistoryItems(historyItems) {
    return historyItems.map(item => ({
      id: item.id,
      url: item.url,
      title: item.title,
      lastVisitTime: item.lastVisitTime,
      visitCount: item.visitCount,
      domain: this.extractDomain(item.url),
      category: this.categorizeDomain(this.extractDomain(item.url)),
      isSearch: this.isSearchQuery(item.url),
      searchQuery: this.extractSearchQuery(item.url),
      timeOfDay: this.getTimeOfDay(item.lastVisitTime),
      dayOfWeek: this.getDayOfWeek(item.lastVisitTime)
    }));
  }

  processSearchItems(searchItems) {
    return searchItems.map(item => ({
      id: item.id,
      url: item.url,
      title: item.title,
      lastVisitTime: item.lastVisitTime,
      searchQuery: this.extractSearchQuery(item.url),
      searchEngine: this.getSearchEngine(item.url),
      domain: this.extractDomain(item.url),
      category: this.categorizeDomain(this.extractDomain(item.url))
    }));
  }

  analyzeDomainPatterns(historyItems) {
    const domainStats = new Map();
    const timePatterns = new Map();
    const categoryStats = new Map();

    historyItems.forEach(item => {
      const domain = this.extractDomain(item.url);
      const category = this.categorizeDomain(domain);
      const timeOfDay = this.getTimeOfDay(item.lastVisitTime);
      const dayOfWeek = this.getDayOfWeek(item.lastVisitTime);

      // Domain statistics
      if (!domainStats.has(domain)) {
        domainStats.set(domain, {
          domain,
          visitCount: 0,
          lastVisit: 0,
          category,
          urls: []
        });
      }
      const domainStat = domainStats.get(domain);
      domainStat.visitCount += item.visitCount || 1;
      domainStat.lastVisit = Math.max(domainStat.lastVisit, item.lastVisitTime);
      domainStat.urls.push(item.url);

      // Time patterns
      if (!timePatterns.has(timeOfDay)) {
        timePatterns.set(timeOfDay, { morning: 0, afternoon: 0, evening: 0, night: 0 });
      }
      timePatterns.get(timeOfDay)[this.getTimeOfDay(item.lastVisitTime)]++;

      // Category statistics
      if (!categoryStats.has(category)) {
        categoryStats.set(category, { count: 0, domains: new Set() });
      }
      categoryStats.get(category).count++;
      categoryStats.get(category).domains.add(domain);
    });

    return {
      domainStats: Array.from(domainStats.values()).sort((a, b) => b.visitCount - a.visitCount),
      timePatterns: Object.fromEntries(timePatterns),
      categoryStats: Object.fromEntries(
        Array.from(categoryStats.entries()).map(([category, stats]) => [
          category,
          { count: stats.count, domains: Array.from(stats.domains) }
        ])
      ),
      totalVisits: historyItems.reduce((sum, item) => sum + (item.visitCount || 1), 0),
      uniqueDomains: domainStats.size
    };
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url.split('/')[0] || url;
    }
  }

  categorizeDomain(domain) {
    for (const [category, domains] of this.domainCategories.entries()) {
      if (domains.some(d => domain.includes(d) || d.includes(domain))) {
        return category;
      }
    }
    return 'general';
  }

  isSearchQuery(url) {
    const searchIndicators = ['search', 'q=', 'query=', 's=', 'search?', 'google.com/search'];
    return searchIndicators.some(indicator => url.toLowerCase().includes(indicator));
  }

  extractSearchQuery(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('q') || 
             urlObj.searchParams.get('query') || 
             urlObj.searchParams.get('s') ||
             this.extractSearchFromPath(urlObj.pathname);
    } catch {
      return null;
    }
  }

  extractSearchFromPath(pathname) {
    // Extract search terms from pathname for sites like Wikipedia
    const searchPatterns = [
      /\/wiki\/(.+)/,           // Wikipedia
      /\/search\/(.+)/,         // General search
      /\/tag\/(.+)/,            // Tag-based search
      /\/category\/(.+)/        // Category-based search
    ];

    for (const pattern of searchPatterns) {
      const match = pathname.match(pattern);
      if (match) {
        return decodeURIComponent(match[1].replace(/[_-]/g, ' '));
      }
    }
    return null;
  }

  getSearchEngine(url) {
    if (url.includes('google.com')) return 'Google';
    if (url.includes('bing.com')) return 'Bing';
    if (url.includes('yahoo.com')) return 'Yahoo';
    if (url.includes('duckduckgo.com')) return 'DuckDuckGo';
    if (url.includes('youtube.com')) return 'YouTube';
    if (url.includes('github.com')) return 'GitHub';
    return 'Other';
  }

  getTimeOfDay(timestamp) {
    const hour = new Date(timestamp).getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  getDayOfWeek(timestamp) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(timestamp).getDay()];
  }

  async getBehavioralInsights() {
    const [recentHistory, searchHistory, domainAnalysis] = await Promise.all([
      this.getRecentHistory(100),
      this.getSearchHistory(50),
      this.getDomainAnalysis(24)
    ]);

    return {
      browsingPatterns: this.analyzeBrowsingPatterns(recentHistory),
      searchBehavior: this.analyzeSearchBehavior(searchHistory),
      domainPreferences: this.analyzeDomainPreferences(domainAnalysis),
      productivityScore: this.calculateProductivityScore(recentHistory, domainAnalysis),
      focusPatterns: this.analyzeFocusPatterns(recentHistory),
      workStyle: this.determineWorkStyle(recentHistory, searchHistory)
    };
  }

  analyzeBrowsingPatterns(history) {
    const patterns = {
      highProductivity: 0,
      researchIntensive: 0,
      socialMedia: 0,
      shopping: 0,
      newsReading: 0
    };

    history.forEach(item => {
      switch (item.category) {
        case 'productivity':
          patterns.highProductivity++;
          break;
        case 'research':
          patterns.researchIntensive++;
          break;
        case 'social':
          patterns.socialMedia++;
          break;
        case 'shopping':
          patterns.shopping++;
          break;
        case 'news':
          patterns.newsReading++;
          break;
      }
    });

    return patterns;
  }

  analyzeSearchBehavior(searchHistory) {
    const searchPatterns = {
      totalSearches: searchHistory.length,
      searchEngines: new Map(),
      searchCategories: new Map(),
      commonQueries: new Map()
    };

    searchHistory.forEach(item => {
      // Search engine usage
      const engine = item.searchEngine;
      searchPatterns.searchEngines.set(engine, (searchPatterns.searchEngines.get(engine) || 0) + 1);

      // Search categories
      const category = item.category;
      searchPatterns.searchCategories.set(category, (searchPatterns.searchCategories.get(category) || 0) + 1);

      // Common search queries
      if (item.searchQuery) {
        const query = item.searchQuery.toLowerCase();
        searchPatterns.commonQueries.set(query, (searchPatterns.commonQueries.get(query) || 0) + 1);
      }
    });

    return searchPatterns;
  }

  analyzeDomainPreferences(domainAnalysis) {
    const preferences = {
      topDomains: domainAnalysis.domainStats.slice(0, 10),
      categoryDistribution: domainAnalysis.categoryStats,
      timePreferences: domainAnalysis.timePatterns,
      visitFrequency: this.calculateVisitFrequency(domainAnalysis.domainStats)
    };

    return preferences;
  }

  calculateProductivityScore(history, domainAnalysis) {
    const productivityDomains = domainAnalysis.domainStats.filter(
      stat => stat.category === 'productivity'
    );
    
    const productivityVisits = productivityDomains.reduce(
      (sum, stat) => sum + stat.visitCount, 0
    );
    
    const totalVisits = domainAnalysis.totalVisits;
    
    return totalVisits > 0 ? (productivityVisits / totalVisits) * 100 : 0;
  }

  analyzeFocusPatterns(history) {
    const timeSlots = new Map();
    
    history.forEach(item => {
      const timeSlot = this.getTimeOfDay(item.lastVisitTime);
      if (!timeSlots.has(timeSlot)) {
        timeSlots.set(timeSlot, { visits: 0, domains: new Set() });
      }
      timeSlots.get(timeSlot).visits++;
      timeSlots.get(timeSlot).domains.add(item.domain);
    });

    // Calculate focus score based on domain concentration
    let focusScore = 0;
    timeSlots.forEach((slot, time) => {
      const concentration = slot.visits / slot.domains.size;
      if (concentration > 3) focusScore += 25; // High concentration = good focus
    });

    return Math.min(100, focusScore);
  }

  determineWorkStyle(history, searchHistory) {
    const patterns = this.analyzeBrowsingPatterns(history);
    const searchCount = searchHistory.length;
    
    if (patterns.researchIntensive > 20 || searchCount > 30) {
      return 'researcher';
    } else if (patterns.highProductivity > 15) {
      return 'productivity_focused';
    } else if (patterns.socialMedia > 10) {
      return 'social_media_user';
    } else if (searchCount > 15) {
      return 'information_seeker';
    } else {
      return 'general_browser';
    }
  }

  calculateVisitFrequency(domainStats) {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return domainStats.map(stat => ({
      ...stat,
      daysSinceLastVisit: Math.floor((now - stat.lastVisit) / oneDay),
      visitsPerDay: stat.visitCount / Math.max(1, Math.floor((now - stat.lastVisit) / oneDay))
    }));
  }

  // Mock data fallback when Chrome API is not available
  getMockHistoryData(limit) {
    const mockData = [];
    const domains = ['google.com', 'github.com', 'stackoverflow.com', 'notion.so', 'trello.com'];
    
    for (let i = 0; i < limit; i++) {
      mockData.push({
        id: i,
        url: `https://${domains[i % domains.length]}/page${i}`,
        title: `Mock Page ${i}`,
        lastVisitTime: Date.now() - (i * 60000),
        visitCount: Math.floor(Math.random() * 10) + 1,
        domain: domains[i % domains.length],
        category: this.categorizeDomain(domains[i % domains.length]),
        isSearch: false,
        searchQuery: null,
        timeOfDay: this.getTimeOfDay(Date.now() - (i * 60000)),
        dayOfWeek: this.getDayOfWeek(Date.now() - (i * 60000))
      });
    }
    
    return mockData;
  }

  getMockSearchData(limit) {
    const mockSearches = [];
    const searchQueries = [
      'React hooks tutorial', 'JavaScript async await', 'CSS grid layout',
      'Node.js best practices', 'Python data analysis', 'Machine learning basics'
    ];
    
    for (let i = 0; i < limit; i++) {
      mockSearches.push({
        id: i,
        url: `https://google.com/search?q=${encodeURIComponent(searchQueries[i % searchQueries.length])}`,
        title: `Search: ${searchQueries[i % searchQueries.length]}`,
        lastVisitTime: Date.now() - (i * 300000),
        searchQuery: searchQueries[i % searchQueries.length],
        searchEngine: 'Google',
        domain: 'google.com',
        category: 'research'
      });
    }
    
    return mockSearches;
  }

  getMockDomainAnalysis(hours) {
    return {
      domainStats: [
        { domain: 'github.com', visitCount: 45, lastVisit: Date.now() - 3600000, category: 'productivity', urls: [] },
        { domain: 'stackoverflow.com', visitCount: 32, lastVisit: Date.now() - 7200000, category: 'research', urls: [] },
        { domain: 'notion.so', visitCount: 28, lastVisit: Date.now() - 10800000, category: 'productivity', urls: [] }
      ],
      timePatterns: { morning: 25, afternoon: 40, evening: 30, night: 15 },
      categoryStats: {
        productivity: { count: 73, domains: ['github.com', 'notion.so'] },
        research: { count: 32, domains: ['stackoverflow.com'] }
      },
      totalVisits: 110,
      uniqueDomains: 3
    };
  }
}
