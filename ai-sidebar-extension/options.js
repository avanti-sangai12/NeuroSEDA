// NeuroSEDA Options Page

const DEFAULT_SETTINGS = {
  GEMINI_API_KEY: '',
  apiModel: 'gemini-2.0-flash',
  maxResponseLength: 1024,
  enableTextSelection: true,
  enableImageAnalysis: true,
  enableElementInspector: true,
  enableNotifications: true,
  theme: 'auto',
  enableChatHistory: true
};

// DOM Elements
const apiKeyInput = document.getElementById('apiKey');
const toggleApiKeyBtn = document.getElementById('toggleApiKeyBtn');
const apiModelSelect = document.getElementById('apiModel');
const maxResponseLengthInput = document.getElementById('maxResponseLength');
const enableTextSelectionCheckbox = document.getElementById('enableTextSelection');
const enableImageAnalysisCheckbox = document.getElementById('enableImageAnalysis');
const enableElementInspectorCheckbox = document.getElementById('enableElementInspector');
const enableNotificationsCheckbox = document.getElementById('enableNotifications');
const themeSelect = document.getElementById('theme');
const enableChatHistoryCheckbox = document.getElementById('enableChatHistory');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const statusMessage = document.getElementById('status');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    console.log('[NeuroSEDA] Loading settings from storage');
    
    apiKeyInput.value = settings.GEMINI_API_KEY || '';
    apiModelSelect.value = settings.apiModel || 'gemini-2.0-flash';
    maxResponseLengthInput.value = settings.maxResponseLength || 1024;
    enableTextSelectionCheckbox.checked = settings.enableTextSelection !== false;
    enableImageAnalysisCheckbox.checked = settings.enableImageAnalysis !== false;
    enableElementInspectorCheckbox.checked = settings.enableElementInspector !== false;
    enableNotificationsCheckbox.checked = settings.enableNotifications !== false;
    themeSelect.value = settings.theme || 'auto';
    enableChatHistoryCheckbox.checked = settings.enableChatHistory !== false;
    
    // Mask API key display
    maskApiKey();
  });
}

// Setup event listeners
function setupEventListeners() {
  // Toggle API key visibility
  toggleApiKeyBtn.addEventListener('click', () => {
    const type = apiKeyInput.type === 'password' ? 'text' : 'password';
    apiKeyInput.type = type;
    toggleApiKeyBtn.textContent = type === 'password' ? '👁️' : '🙈';
  });

  // Save settings
  saveBtn.addEventListener('click', saveSettings);

  // Reset to defaults
  resetBtn.addEventListener('click', () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      resetSettings();
    }
  });

  // Clear all data
  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all data including chat history? This cannot be undone.')) {
      clearAllData();
    }
  });

  // Validate API key format on input
  apiKeyInput.addEventListener('input', validateApiKey);
}

// Mask API key input
function maskApiKey() {
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'password';
  }
}

// Validate API key format
function validateApiKey() {
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    showStatus('⚠️ API key is required', 'warning');
    return false;
  }
  
  if (apiKey.length < 20) {
    showStatus('⚠️ API key seems too short', 'warning');
    return false;
  }
  
  return true;
}

// Save settings to storage
function saveSettings() {
  // Validate API key
  if (!validateApiKey()) {
    return;
  }

  const settings = {
    GEMINI_API_KEY: apiKeyInput.value.trim(),
    apiModel: apiModelSelect.value,
    maxResponseLength: parseInt(maxResponseLengthInput.value),
    enableTextSelection: enableTextSelectionCheckbox.checked,
    enableImageAnalysis: enableImageAnalysisCheckbox.checked,
    enableElementInspector: enableElementInspectorCheckbox.checked,
    enableNotifications: enableNotificationsCheckbox.checked,
    theme: themeSelect.value,
    enableChatHistory: enableChatHistoryCheckbox.checked
  };

  chrome.storage.sync.set(settings, () => {
    if (chrome.runtime.lastError) {
      console.error('[NeuroSEDA] Error saving settings:', chrome.runtime.lastError);
      showStatus('❌ Error saving settings', 'error');
      return;
    }

    console.log('[NeuroSEDA] Settings saved successfully');
    showStatus('✅ Settings saved successfully!', 'success');

    // Notify background script of updated settings
    chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED' }, (response) => {
      console.log('[NeuroSEDA] Background script notified of settings update');
    }).catch(() => {
      // Background script might not be ready, that's OK
    });
  });
}

// Reset to default settings
function resetSettings() {
  chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
    if (chrome.runtime.lastError) {
      showStatus('❌ Error resetting settings', 'error');
      return;
    }

    loadSettings();
    showStatus('✅ Settings reset to defaults', 'success');
  });
}

// Clear all data
function clearAllData() {
  chrome.storage.sync.clear(() => {
    if (chrome.runtime.lastError) {
      showStatus('❌ Error clearing data', 'error');
      return;
    }

    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        showStatus('❌ Error clearing data', 'error');
        return;
      }

      loadSettings();
      showStatus('✅ All data cleared successfully', 'success');
    });
  });
}

// Show status message
function showStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message status-${type}`;

  // Clear status message after 3 seconds
  setTimeout(() => {
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  }, 3000);
}

console.log('[NeuroSEDA] Options page loaded');
