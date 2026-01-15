// Debug version of NeuroSEDA content script
console.log('🔍 NeuroSEDA Content Script Debug: Starting execution...');
console.log('🔍 Current URL:', window.location.href);
console.log('🔍 Current domain:', window.location.hostname);
console.log('🔍 Chrome runtime available:', typeof chrome !== 'undefined');
console.log('🔍 Chrome runtime ID:', typeof chrome !== 'undefined' ? chrome.runtime?.id : 'N/A');

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
  console.log('🔍 NeuroSEDA: Content script DISABLED on this page:', currentUrl);
  console.log('🔍 Reason: Page is excluded from content script execution');
  return; // Exit immediately
}

console.log('🔍 NeuroSEDA: Content script ENABLED on this page:', currentUrl);
console.log('🔍 Proceeding with initialization...');

// Rest of the content script would go here...
console.log('🔍 Content script initialization complete');
