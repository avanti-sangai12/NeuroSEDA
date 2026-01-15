// Content script for NeuroSEDA - runs on every webpage
(function() {
  'use strict';

  // IMMEDIATE EXIT if we're on a page where we shouldn't run
  const currentUrl = window.location.href;
  if (currentUrl.startsWith('chrome://') || 
      currentUrl.startsWith('chrome-extension://') || 
      currentUrl.includes('localhost:3000') ||
      currentUrl.includes('127.0.0.1:3000') ||
      !currentUrl || 
      currentUrl === 'about:blank' || 
      currentUrl === 'data:' || 
      currentUrl === 'file:') {
    console.log('NeuroSEDA: Content script disabled on this page:', currentUrl);
    return; // Exit immediately
  }

  // ADDITIONAL SAFETY CHECK - only run on regular web pages
  if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
    console.log('NeuroSEDA: Content script disabled on non-HTTP page:', currentUrl);
    return; // Exit immediately
  }

  let isInitialized = false;
  let behavioralData = {
    pageLoadTime: Date.now(),
    mouseMovements: 0,
    keystrokes: 0,
    scrollEvents: 0,
    clicks: 0,
    focusEvents: 0,
    timeOnPage: 0,
    url: window.location.href,
    domain: window.location.hostname,
    title: document.title
  };

  let lastActivity = Date.now();
  let activityTimer = null;

  // Initialize the content script
  function initialize() {
    if (isInitialized) return;
    
    // Check if we're on a page where the extension should run
    // Skip if we're on chrome://, chrome-extension://, or localhost:3000 (our app)
    const currentUrl = window.location.href;
    if (currentUrl.startsWith('chrome://') || 
        currentUrl.startsWith('chrome-extension://') || 
        currentUrl.includes('localhost:3000')) {
      console.log('NeuroSEDA: Skipping initialization on this page:', currentUrl);
      return;
    }
    
    // Additional safety check - if we're not on a valid page, don't initialize
    if (!currentUrl || currentUrl === 'about:blank' || currentUrl === 'data:' || currentUrl === 'file:') {
      console.log('NeuroSEDA: Skipping initialization on invalid page:', currentUrl);
      return;
    }
    
    console.log('NeuroSEDA content script initialized on:', window.location.href);
    isInitialized = true;
    
    // Set up event listeners
    setupEventListeners();
    
    // Start activity monitoring
    startActivityMonitoring();
    
    // Send initial page data
    sendPageData();
  }

  function setupEventListeners() {
    // Mouse movement tracking
    let mouseMoveThrottle = null;
    document.addEventListener('mousemove', (e) => {
      behavioralData.mouseMovements++;
      updateLastActivity();
      
      // Throttle mouse movement data to avoid overwhelming
      if (mouseMoveThrottle) clearTimeout(mouseMoveThrottle);
      mouseMoveThrottle = setTimeout(() => {
        sendBehavioralUpdate('mouseMovement');
      }, 1000);
    });

    // Keystroke tracking
    document.addEventListener('keydown', (e) => {
      // Skip system keys and modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'Tab' || e.key === 'Escape') {
        return;
      }
      
      behavioralData.keystrokes++;
      updateLastActivity();
      
      // Send keystroke data immediately for real-time analysis
      sendBehavioralUpdate('keystroke');
    });

    // Scroll tracking
    let scrollThrottle = null;
    document.addEventListener('scroll', (e) => {
      behavioralData.scrollEvents++;
      updateLastActivity();
      
      if (scrollThrottle) clearTimeout(scrollThrottle);
      scrollThrottle = setTimeout(() => {
        sendBehavioralUpdate('scroll');
      }, 500);
    });

    // Click tracking
    document.addEventListener('click', (e) => {
      behavioralData.clicks++;
      updateLastActivity();
      
      // Track click targets for better context
      const clickTarget = {
        tagName: e.target.tagName,
        className: e.target.className,
        id: e.target.id,
        text: e.target.textContent?.substring(0, 50),
        timestamp: Date.now()
      };
      
      sendBehavioralUpdate('click', clickTarget);
    });

    // Focus tracking
    document.addEventListener('focusin', (e) => {
      behavioralData.focusEvents++;
      updateLastActivity();
      
      const focusTarget = {
        tagName: e.target.tagName,
        className: e.target.className,
        id: e.target.id,
        type: e.target.type,
        timestamp: Date.now()
      };
      
      sendBehavioralUpdate('focus', focusTarget);
    });

    // Page visibility tracking
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        sendBehavioralUpdate('pageHidden');
      } else {
        sendBehavioralUpdate('pageVisible');
      }
    });

    // Form interaction tracking
    document.addEventListener('submit', (e) => {
      const formData = {
        action: e.target.action,
        method: e.target.method,
        fieldCount: e.target.elements.length,
        timestamp: Date.now()
      };
      
      sendBehavioralUpdate('formSubmit', formData);
    });

    // Link tracking
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) {
        const linkData = {
          href: link.href,
          text: link.textContent?.substring(0, 100),
          isExternal: link.hostname !== window.location.hostname,
          timestamp: Date.now()
        };
        
        sendBehavioralUpdate('linkClick', linkData);
      }
    });

    // Search query detection
    detectSearchQueries();
  }

  function detectSearchQueries() {
    // Look for common search patterns
    const searchInputs = document.querySelectorAll('input[type="search"], input[name*="search"], input[name*="q"], input[placeholder*="search"]');
    
    searchInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        if (e.target.value.length > 2) {
          const searchData = {
            query: e.target.value,
            inputType: e.target.type,
            inputName: e.target.name,
            timestamp: Date.now()
          };
          
          sendBehavioralUpdate('searchQuery', searchData);
        }
      });
    });
  }

  function startActivityMonitoring() {
    // Update time on page every second
    setInterval(() => {
      behavioralData.timeOnPage = Date.now() - behavioralData.pageLoadTime;
    }, 1000);

    // Check for inactivity
    setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      
      if (inactiveTime > 300000) { // 5 minutes
        sendBehavioralUpdate('inactivity', { duration: inactiveTime });
      }
    }, 60000); // Check every minute
  }

  function updateLastActivity() {
    lastActivity = Date.now();
    
    // Clear existing timer
    if (activityTimer) clearTimeout(activityTimer);
    
    // Set new timer for activity burst
    activityTimer = setTimeout(() => {
      sendBehavioralUpdate('activityBurst', {
        mouseMovements: behavioralData.mouseMovements,
        keystrokes: behavioralData.keystrokes,
        scrollEvents: behavioralData.scrollEvents,
        clicks: behavioralData.clicks
      });
    }, 2000);
  }

  function sendBehavioralUpdate(type, additionalData = {}) {
    try {
      const updateData = {
        action: 'behavioralUpdate',
        type: type,
        data: {
          ...behavioralData,
          ...additionalData,
          timestamp: Date.now()
        }
      };

      // Send to background script only if Chrome extension is available and working
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        try {
          chrome.runtime.sendMessage(updateData).catch((error) => {
            console.log('NeuroSEDA: Failed to send message to background script:', error);
          });
        } catch (error) {
          console.log('NeuroSEDA: Error sending message to background script:', error);
        }
      }

      // Also send to parent window for main app integration
      try {
        window.postMessage({
          source: 'neuroSEDA',
          ...updateData
        }, '*');
      } catch (error) {
        console.log('NeuroSEDA: Error sending postMessage:', error);
      }
    } catch (error) {
      console.log('NeuroSEDA: Error in sendBehavioralUpdate:', error);
    }
  }

  function sendPageData() {
    try {
      const pageData = {
        action: 'pageData',
        data: {
          url: window.location.href,
          domain: window.location.hostname,
          title: document.title,
          referrer: document.referrer,
          loadTime: Date.now(),
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      };

      // Send to background script only if Chrome extension is available and working
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        try {
          chrome.runtime.sendMessage(pageData).catch((error) => {
            console.log('NeuroSEDA: Failed to send page data to background script:', error);
          });
        } catch (error) {
          console.log('NeuroSEDA: Error sending page data to background script:', error);
        }
      }
    } catch (error) {
      console.log('NeuroSEDA: Error in sendPageData:', error);
    }
  }

  // Listen for messages from background script only if Chrome extension is available
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'tabUpdated') {
        // Update current page context
        behavioralData.url = request.data.url;
        behavioralData.domain = request.data.domain;
        behavioralData.title = request.data.title;
        
        // Send updated context
        sendBehavioralUpdate('contextUpdate', request.data);
      }
      
      if (request.action === 'getCurrentContext') {
        sendResponse({
          success: true,
          data: behavioralData
        });
      }
    });
  }

  // Listen for messages from parent window (main app)
  window.addEventListener('message', (event) => {
    if (event.source !== window && event.data.source === 'neuroSEDA') {
      return;
    }

    if (event.data.action === 'getBehavioralData') {
      event.source.postMessage({
        source: 'neuroSEDA',
        action: 'behavioralDataResponse',
        data: behavioralData
      }, event.origin);
    }
  });

  // Performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          const performanceMetrics = {
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
          };
          
          sendBehavioralUpdate('performance', performanceMetrics);
        }
      }, 1000);
    });
  }

  // Error tracking
  window.addEventListener('error', (e) => {
    try {
      sendBehavioralUpdate('error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error?.stack
      });
    } catch (error) {
      console.log('NeuroSEDA: Error in error handler:', error);
    }
  });

  // Unhandled promise rejection tracking
  window.addEventListener('unhandledrejection', (e) => {
    try {
      sendBehavioralUpdate('unhandledRejection', {
        reason: e.reason,
        timestamp: Date.now()
      });
    } catch (error) {
      console.log('NeuroSEDA: Error in unhandled rejection handler:', error);
    }
  });

  // Page unload tracking
  window.addEventListener('beforeunload', () => {
    sendBehavioralUpdate('pageUnload', {
      timeOnPage: behavioralData.timeOnPage,
      totalActivity: behavioralData.mouseMovements + behavioralData.keystrokes + behavioralData.scrollEvents
    });
  });

  // Initialize when DOM is ready
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      initialize();
    }

    // Fallback initialization
    setTimeout(initialize, 1000);
  } catch (error) {
    console.log('NeuroSEDA: Error during initialization:', error);
  }

  // Export for external access
  try {
    window.neuroSEDA = {
      getBehavioralData: () => behavioralData,
      sendCustomEvent: (type, data) => sendBehavioralUpdate(type, data),
      resetCounters: () => {
        behavioralData.mouseMovements = 0;
        behavioralData.keystrokes = 0;
        behavioralData.scrollEvents = 0;
        behavioralData.clicks = 0;
        behavioralData.focusEvents = 0;
      }
    };
  } catch (error) {
    console.log('NeuroSEDA: Error exporting to window:', error);
  }

})();
