// NeuroSEDA Chrome Extension Integration Script
// Include this in your app to communicate with the extension

class NeuroSEDAExtension {
  constructor() {
    this.isExtensionAvailable = false;
    this.checkExtensionAvailability();
  }

  // Check if the Chrome extension is available
  async checkExtensionAvailability() {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        // Test communication with extension
        const response = await this.sendMessage({ action: 'ping' });
        this.isExtensionAvailable = response && response.success;
        console.log('NeuroSEDA extension available:', this.isExtensionAvailable);
      } else {
        this.isExtensionAvailable = false;
        console.log('NeuroSEDA extension not available');
      }
    } catch (error) {
      this.isExtensionAvailable = false;
      console.log('NeuroSEDA extension check failed:', error);
    }
  }

  // Send message to Chrome extension
  async sendMessage(message) {
    if (!this.isExtensionAvailable) {
      throw new Error('Chrome extension not available');
    }

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Get behavioral data from extension
  async getBehavioralData(timeRange = 24) {
    try {
      const response = await this.sendMessage({
        action: 'getBehavioralData',
        timeRange: timeRange
      });
      return response;
    } catch (error) {
      console.error('Failed to get behavioral data:', error);
      return null;
    }
  }

  // Get history insights from extension
  async getHistoryInsights(hours = 24) {
    try {
      const response = await this.sendMessage({
        action: 'getHistoryInsights',
        hours: hours
      });
      return response;
    } catch (error) {
      console.error('Failed to get history insights:', error);
      return null;
    }
  }

  // Get search patterns from extension
  async getSearchPatterns(days = 7) {
    try {
      const response = await this.sendMessage({
        action: 'getSearchPatterns',
        days: days
      });
      return response;
    } catch (error) {
      console.error('Failed to get search patterns:', error);
      return null;
    }
  }

  // Get popup data from extension
  async getPopupData() {
    try {
      const response = await this.sendMessage({
        action: 'getPopupData'
      });
      return response;
    } catch (error) {
      console.error('Failed to get popup data:', error);
      return null;
    }
  }

  // Check if extension is connected
  isConnected() {
    return this.isExtensionAvailable;
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.isExtensionAvailable,
      timestamp: new Date().toISOString()
    };
  }
}

// Create global instance
window.neuroSEDAExtension = new NeuroSEDAExtension();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NeuroSEDAExtension;
}
