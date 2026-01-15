// Popup script for NeuroSEDA Chrome extension
document.addEventListener('DOMContentLoaded', function() {
  // Initialize popup with basic data
  initializePopup();
  
  // Update data every few seconds
  setInterval(updatePopupData, 3000);
});

function initializePopup() {
  // In Manifest V3, we can't use getBackgroundPage
  // Instead, we'll test the service worker connection first
  testServiceWorkerConnection();
}

function testServiceWorkerConnection() {
  // Test if service worker is ready
  chrome.runtime.sendMessage({
    action: 'ping'
  }, function(response) {
    if (chrome.runtime.lastError) {
      console.log('Service worker not ready:', chrome.runtime.lastError.message);
      setFallbackData();
      return;
    }
    
    if (response && response.success) {
      console.log('Service worker is ready:', response.message);
      updatePopupData();
    } else {
      setFallbackData();
    }
  });
}

function updatePopupData() {
  // Request current data from background script
  chrome.runtime.sendMessage({
    action: 'getPopupData'
  }, function(response) {
    if (chrome.runtime.lastError) {
      // Handle service worker errors gracefully
      console.log('Service worker not ready yet:', chrome.runtime.lastError.message);
      setFallbackData();
      return;
    }
    
    if (response && response.success) {
      document.getElementById('pageCount').textContent = response.data.pageCount || '0';
      document.getElementById('dataPoints').textContent = response.data.dataPoints || '0';
      document.getElementById('lastUpdate').textContent = response.data.lastUpdate || 'Never';
      
      // Update status to show success
      const statusIndicator = document.getElementById('statusIndicator');
      const statusText = document.getElementById('statusText');
      if (statusIndicator) statusIndicator.style.background = '#10b981'; // Green for success
      if (statusText) statusText.textContent = 'Extension Active';
    } else {
      setFallbackData();
    }
  });
}

function setFallbackData() {
  // Set fallback data when service worker is not ready
  document.getElementById('pageCount').textContent = 'Loading...';
  document.getElementById('dataPoints').textContent = 'Loading...';
  document.getElementById('lastUpdate').textContent = 'Initializing...';
  
  // Update status indicator
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  if (statusIndicator) statusIndicator.style.background = '#f59e0b'; // Orange for loading
  if (statusText) statusText.textContent = 'Initializing...';
  
  // Retry after a short delay
  setTimeout(() => {
    updatePopupData();
  }, 1000);
}

// Handle popup click to open main app
document.addEventListener('click', function() {
  // Open NeuroSEDA app in new tab
  chrome.tabs.create({
    url: 'http://localhost:3000' // Adjust this URL to match your app
  });
});
