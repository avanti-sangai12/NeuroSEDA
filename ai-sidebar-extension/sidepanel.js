// NeuroSEDA AI Sidebar - Main JavaScript
// API Key is loaded from Chrome storage in background.js

// DOM Elements
const messagesContainer = document.getElementById('messagesContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const selectElementBtn = document.getElementById('selectElementBtn');
const clearElementBtn = document.getElementById('clearElementBtn');
const elementInfo = document.getElementById('elementInfo');
const elementTag = document.getElementById('elementTag');
const elementText = document.getElementById('elementText');
const loadingSpinner = document.getElementById('loadingSpinner');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const inspectStartBtn = document.getElementById('inspectStartBtn');
const inspectStopBtn = document.getElementById('inspectStopBtn');
const inspectorOutput = document.getElementById('inspectorOutput');
const noElementMsg = document.getElementById('noElementMsg');
const copyHtmlBtn = document.getElementById('copyHtmlBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// AI Tools elements
const writeEmailBtn = document.getElementById('writeEmailBtn');
const rephraseBtn = document.getElementById('rephraseBtn');
const fixGrammarBtn = document.getElementById('fixGrammarBtn');
const explainBtn = document.getElementById('explainBtn');
const summarizeBtn = document.getElementById('summarizeBtn');
const generateBtn = document.getElementById('generateBtn');
const toolInputSection = document.getElementById('toolInputSection');
const toolInput = document.getElementById('toolInput');
const toneSelect = document.getElementById('toneSelect');
const processToolBtn = document.getElementById('processToolBtn');
const cancelToolBtn = document.getElementById('cancelToolBtn');
const toolResults = document.getElementById('toolResults');
const toolResultsContent = document.getElementById('toolResultsContent');
const insertToolResultBtn = document.getElementById('insertToolResultBtn');
const copyToolResultBtn = document.getElementById('copyToolResultBtn');

// Summary elements
const generateSummaryBtn = document.getElementById('generateSummaryBtn');
const refreshSummaryBtn = document.getElementById('refreshSummaryBtn');
const summaryDisplay = document.getElementById('summaryDisplay');
const summaryContent = document.getElementById('summaryContent');
const summaryLoading = document.getElementById('summaryLoading');
const summaryError = document.getElementById('summaryError');
const pageInfo = document.getElementById('pageInfo');
const pageTitle = document.getElementById('pageTitle');
const pageUrl = document.getElementById('pageUrl');
const contentLength = document.getElementById('contentLength');

let currentTab = 'chat';
let currentSummary = null;
let isSelectionMode = false;
let selectedElement = null;
let chatHistory = [];
let currentTool = null;
let selectedTextForEditing = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('[NeuroSEDA Sidebar] Initializing...');
  loadChatHistory();
  setupEventListeners();
  
  // Show initial greeting
  addMessageToChat(
    '👋 Welcome to NeuroSEDA!\n\n' +
    'To use element selection:\n' +
    '1. Make sure you have a webpage open (not a Chrome page)\n' +
    '2. Go to the "Element" tab (🎯)\n' +
    '3. Click "Start Selecting"\n' +
    '4. Click elements on the page to select them',
    'bot'
  );
});

function setupEventListeners() {
  // Send message
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      sendMessage();
    }
  });

  // Element selection
  selectElementBtn.addEventListener('click', toggleElementSelection);
  clearElementBtn.addEventListener('click', clearSelection);

  // Inspector
  inspectStartBtn.addEventListener('click', startElementInspection);
  inspectStopBtn.addEventListener('click', stopElementInspection);
  copyHtmlBtn.addEventListener('click', copyHtmlToClipboard);

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Settings
  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all chat history? This cannot be undone.')) {
      chatHistory = [];
      saveChatHistory();
      messagesContainer.innerHTML = '<div class="message bot-message"><div class="message-content"><p>Chat history cleared. 🗑️</p></div></div>';
    }
  });

  // AI Tools event listeners
  writeEmailBtn.addEventListener('click', () => showToolInput('email'));
  rephraseBtn.addEventListener('click', () => showToolInput('rephrase'));
  fixGrammarBtn.addEventListener('click', () => showToolInput('fix-grammar'));
  explainBtn.addEventListener('click', () => showToolInput('explain'));
  summarizeBtn.addEventListener('click', () => showToolInput('summarize'));
  generateBtn.addEventListener('click', () => showToolInput('generate'));
  
  processToolBtn.addEventListener('click', processTool);
  cancelToolBtn.addEventListener('click', hideToolInput);
  insertToolResultBtn.addEventListener('click', insertToolResult);
  copyToolResultBtn.addEventListener('click', copyToolResult);

  // Summary event listeners
  if (generateSummaryBtn) {
    generateSummaryBtn.addEventListener('click', generateWebpageSummary);
  }
  if (refreshSummaryBtn) {
    refreshSummaryBtn.addEventListener('click', generateWebpageSummary);
  }

  // Listen for element selection from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[NeuroSEDA Sidebar] Received message:', request.type);
    
    if (request.type === 'ELEMENT_SELECTED') {
      console.log('[NeuroSEDA Sidebar] Element selected:', request.element);
      selectedElement = request.element;
      displaySelectedElement();
      switchTab('chat');
      addMessageToChat('✅ Element selected! Now you can ask questions about it in the chat.', 'bot');
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Unknown message type' });
    }
  });
}

// Send message to Gemini
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  console.log('[NeuroSEDA] Sending message:', message);
  console.log('[NeuroSEDA] Selected element:', selectedElement);

  // Add user message to chat
  addMessageToChat(message, 'user');
  userInput.value = '';

  // Show loading
  showLoading(true);

  try {
    // Verify extension context
    if (!chrome || !chrome.runtime || !chrome.tabs) {
      throw new Error('Extension context not available');
    }

    // Get page context
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      throw new Error('No active tab found');
    }
    console.log('[NeuroSEDA] Active tab:', tab.id, tab.url);
    
    const pageContext = await getPageContext(tab.id);
    console.log('[NeuroSEDA] Page context:', pageContext);

    // Get selected element content if available
    let elementContent = '';
    if (selectedElement) {
      console.log('[NeuroSEDA] Processing selected element');
      
      if (selectedElement.source === 'image_selection') {
        // For images, include the base64 data
        elementContent = `
Selected Image:
- Tag: ${selectedElement.tag}
- Description: ${selectedElement.text}
- Dimensions: ${selectedElement.width}x${selectedElement.height}px
- Source URL: ${selectedElement.src}
- Image Data: ${selectedElement.html}
`;
        console.log('[NeuroSEDA] Image content prepared');
      } else {
        elementContent = `
Selected Element:
- Tag: ${selectedElement.tag}
- Content: ${selectedElement.text}
- HTML: ${selectedElement.html}
- Classes: ${selectedElement.classes}
`;
        console.log('[NeuroSEDA] Element content prepared');
      }
    } else {
      console.log('[NeuroSEDA] No selected element');
    }

    // Send to background script for Gemini API call
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GEMINI_REQUEST',
        prompt: message,
        elementContent: elementContent,
        pageContext: pageContext
      });

      if (response && response.success) {
        const aiMessage = response.data.response;
        addMessageToChat(aiMessage, 'bot');
        chatHistory.push({
          user: message,
          bot: aiMessage,
          timestamp: new Date().toISOString()
        });
        saveChatHistory();
      } else if (response && response.error) {
        addMessageToChat(`Error: ${response.error}`, 'bot');
      } else {
        addMessageToChat('Error: No response from background script', 'bot');
      }
    } catch (messageError) {
      if (messageError.message && messageError.message.includes('context invalidated')) {
        console.warn('[NeuroSEDA] Extension context invalidated');
        addMessageToChat('Extension was reloaded. Please try again.', 'bot');
      } else if (messageError.message && messageError.message.includes('Receiving end does not exist')) {
        console.warn('[NeuroSEDA] Background script not available');
        addMessageToChat('Background script not responding. Try reloading the extension.', 'bot');
      } else {
        throw messageError;
      }
    }
  } catch (error) {
    console.error('[NeuroSEDA] Error:', error);
    if (error.message && error.message.includes('context')) {
      addMessageToChat('Extension context error. Please reload the extension.', 'bot');
    } else {
      addMessageToChat(`Error: ${error.message}`, 'bot');
    }
  } finally {
    showLoading(false);
  }
}

// Add message to chat UI
function addMessageToChat(message, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.style.wordWrap = 'break-word';
  contentDiv.style.whiteSpace = 'pre-wrap';
  
  // Parse markdown-like formatting
  const formattedMessage = formatMessage(message);
  contentDiv.innerHTML = formattedMessage;
  
  // Ensure links open in new tabs and are styled properly
  const links = contentDiv.querySelectorAll('a');
  links.forEach(link => {
    link.style.color = 'var(--primary-color)';
    link.style.textDecoration = 'underline';
    link.style.cursor = 'pointer';
  });
  
  messageDiv.appendChild(contentDiv);
  messagesContainer.appendChild(messageDiv);
  
  // Auto scroll to bottom
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 50);
}

// Format message content with markdown support
function formatMessage(text) {
  let html = text
    // Escape HTML first to prevent injection
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text* (but not **text**)
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code: `text`
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links: [text](url)
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: var(--primary-color); text-decoration: underline;">$1</a>')
    // Bullet points: * item
    .replace(/^\* (.*?)$/gm, '<li style="margin-left: 20px;">$1</li>')
    // Numbered lists: 1. item
    .replace(/^\d+\. (.*?)$/gm, '<li style="margin-left: 20px;">$1</li>')
    // Headings: # Title, ## Subtitle, etc.
    .replace(/^### (.*?)$/gm, '<h3 style="margin: 12px 0 8px 0; font-size: 14px; font-weight: 600;">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 style="margin: 14px 0 10px 0; font-size: 15px; font-weight: 600;">$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1 style="margin: 16px 0 12px 0; font-size: 16px; font-weight: 700;">$1</h1>')
    // Line breaks
    .replace(/\n/g, '<br>');
  
  return html;
}

// Toggle element selection
async function toggleElementSelection() {
  try {
    console.log('[NeuroSEDA] Toggle element selection clicked');
    
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      throw new Error('No active tab found');
    }
    
    const tab = tabs[0];
    console.log('[NeuroSEDA] Active tab:', tab.id, tab.url);
    
    isSelectionMode = !isSelectionMode;
    console.log('[NeuroSEDA] Selection mode:', isSelectionMode ? 'ON' : 'OFF');
    
    selectElementBtn.classList.toggle('active');
    
    // Send message with better error handling
    chrome.tabs.sendMessage(tab.id, {
      type: 'TOGGLE_SELECTION_MODE',
      enabled: isSelectionMode
    }, (response) => {
      if (chrome.runtime.lastError) {
        const errMsg = chrome.runtime.lastError.message;
        console.error('[NeuroSEDA] Message send error:', errMsg);
        selectElementBtn.classList.toggle('active', false);
        isSelectionMode = false;
        
        // Provide helpful error message
        if (errMsg.includes('Receiving end does not exist')) {
          addMessageToChat('⚠️ Content script not ready. Please try again or refresh the page.', 'bot');
        } else if (errMsg.includes('invalidated')) {
          addMessageToChat('⚠️ Extension context lost. Please try again.', 'bot');
        } else {
          addMessageToChat('⚠️ Could not activate element selection. Make sure you have a valid webpage open (not a special Chrome page).', 'bot');
        }
      } else {
        console.log('[NeuroSEDA] Message sent successfully:', response);
        addMessageToChat(isSelectionMode ? '✅ Element selection enabled. Hover and click elements on the page.' : '✅ Element selection disabled.', 'bot');
      }
    });
  } catch (error) {
    console.error('[NeuroSEDA] Element selection error:', error);
    selectElementBtn.classList.toggle('active', false);
    isSelectionMode = false;
    addMessageToChat('❌ Error: ' + error.message + '\nMake sure a webpage is open (not a Chrome special page).', 'bot');
  }
}

// Start element inspection (from inspector tab)
async function startElementInspection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      addMessageToChat('❌ No active tab found. Make sure a webpage is open.', 'bot');
      return;
    }
    
    // Check if it's a special Chrome page
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
      addMessageToChat('❌ Cannot select elements on Chrome special pages. Please open a regular webpage.', 'bot');
      return;
    }
    
    isSelectionMode = true;
    inspectStartBtn.classList.add('hidden');
    inspectStopBtn.classList.remove('hidden');
    addMessageToChat('🎯 Element selection started. Hover over elements and click to select them.', 'bot');
    
    // Retry logic - try multiple times if content script isn't ready
    let retries = 0;
    const maxRetries = 3;
    
    async function sendToggleMessage() {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'TOGGLE_SELECTION_MODE',
          enabled: true
        });
        console.log('[NeuroSEDA] Element selection activated successfully');
      } catch (err) {
        retries++;
        if (retries < maxRetries) {
          console.log(`[NeuroSEDA] Retry ${retries}/${maxRetries} - Content script not ready, retrying...`);
          // Wait 500ms and retry
          await new Promise(resolve => setTimeout(resolve, 500));
          return sendToggleMessage();
        } else {
          console.error('[NeuroSEDA] Could not activate element selection after retries:', err);
          addMessageToChat('⚠️ Content script not ready. Try refreshing the page and try again.', 'bot');
          throw err;
        }
      }
    }
    
    await sendToggleMessage();
  } catch (error) {
    console.error('[NeuroSEDA] Inspection start error:', error);
    inspectStartBtn.classList.remove('hidden');
    inspectStopBtn.classList.add('hidden');
    isSelectionMode = false;
    addMessageToChat('❌ Could not start element selection. ' + error.message, 'bot');
  }
}

// Stop element inspection
async function stopElementInspection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    isSelectionMode = false;
    inspectStartBtn.classList.remove('hidden');
    inspectStopBtn.classList.add('hidden');
    
    await chrome.tabs.sendMessage(tab.id, {
      type: 'TOGGLE_SELECTION_MODE',
      enabled: false
    }).catch((err) => {
      console.log('[NeuroSEDA] Could not stop inspection:', err);
    });
  } catch (error) {
    console.error('[NeuroSEDA] Inspection stop error:', error);
  }
}

// Display selected element in chat tab
function displaySelectedElement() {
  if (!selectedElement) {
    elementInfo.classList.add('hidden');
    return;
  }

  elementInfo.classList.remove('hidden');
  elementTag.textContent = selectedElement.tag;
  
  // Handle image display
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const imagePreview = document.getElementById('imagePreview');
  const imageDimensions = document.getElementById('imageDimensions');
  
  if (selectedElement.source === 'image_selection' && selectedElement.html) {
    // Display image preview
    imagePreviewContainer.classList.remove('hidden');
    imagePreview.src = selectedElement.html;
    
    const width = selectedElement.width || 'unknown';
    const height = selectedElement.height || 'unknown';
    imageDimensions.textContent = `${width}x${height}px`;
    
    elementText.textContent = selectedElement.text || 'Image: ' + (selectedElement.src || 'No URL');
  } else {
    // Hide image preview for non-image elements
    imagePreviewContainer.classList.add('hidden');
    elementText.textContent = selectedElement.text.substring(0, 200) || 'No text content';
  }

  // Also update inspector tab
  updateInspectorDisplay();
}

// Update inspector display
function updateInspectorDisplay() {
  if (!selectedElement) {
    inspectorOutput.classList.add('hidden');
    noElementMsg.classList.remove('hidden');
    return;
  }

  inspectorOutput.classList.remove('hidden');
  noElementMsg.classList.add('hidden');

  document.getElementById('inspTag').textContent = selectedElement.tag;
  document.getElementById('inspId').textContent = selectedElement.id || 'None';
  document.getElementById('inspClasses').textContent = selectedElement.classes || 'None';
  document.getElementById('inspText').textContent = selectedElement.text.substring(0, 500) || 'No text content';
  document.getElementById('inspHtml').textContent = selectedElement.html.substring(0, 1000) || 'No HTML';

  // Display attributes
  const attrsList = document.getElementById('inspAttrs');
  if (Object.keys(selectedElement.attributes).length === 0) {
    attrsList.textContent = 'No additional attributes';
  } else {
    attrsList.innerHTML = Object.entries(selectedElement.attributes)
      .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
      .join('');
  }
}

// Clear selection
function clearSelection() {
  selectedElement = null;
  elementInfo.classList.add('hidden');
  inspectorOutput.classList.add('hidden');
  noElementMsg.classList.remove('hidden');

  // Clear from content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'CLEAR_SELECTION' }).catch((err) => {
        console.log('[NeuroSEDA] Could not clear selection from content script:', err);
      });
    }
  });
}

// Get page context
async function getPageContext(tabId) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_CONTEXT' });
    return response.context;
  } catch (error) {
    console.log('[NeuroSEDA] Could not get page context:', error);
    // Return current tab info from sidebar context
    return {
      url: window.location.href,
      title: document.title,
      description: 'Sidebar context'
    };
  }
}

// Copy HTML to clipboard
async function copyHtmlToClipboard() {
  if (!selectedElement) return;

  try {
    await navigator.clipboard.writeText(selectedElement.html);
    
    const originalText = copyHtmlBtn.textContent;
    copyHtmlBtn.textContent = '✓ Copied!';
    setTimeout(() => {
      copyHtmlBtn.textContent = originalText;
    }, 2000);
  } catch (error) {
    console.error('Copy failed:', error);
  }
}

// ============================================================================
// AI TOOLS FUNCTIONS
// ============================================================================

// Show tool input section
function showToolInput(toolType) {
  currentTool = toolType;
  toolInputSection.classList.remove('hidden');
  toolInput.value = '';
  toolInput.focus();
  
  const toolNames = {
    'email': 'Write Email',
    'rephrase': 'Rephrase Text',
    'fix-grammar': 'Fix Grammar',
    'explain': 'Explain',
    'summarize': 'Summarize',
    'generate': 'Generate Content'
  };
  
  toolInput.placeholder = `Enter text or prompt for ${toolNames[toolType] || toolType}...`;
  
  // If text is selected on page, show it
  if (selectedTextForEditing) {
    toolInput.value = selectedTextForEditing;
  }
}

// Hide tool input section
function hideToolInput() {
  toolInputSection.classList.add('hidden');
  toolInput.value = '';
  currentTool = null;
}

// Process tool request
async function processTool() {
  const text = toolInput.value.trim();
  
  if (!text) {
    showToolStatus('⚠️ Please enter some text or a prompt');
    return;
  }
  
  showLoading(true);
  
  try {
    let request = {};
    
    if (['rephrase', 'fix-grammar', 'explain', 'summarize'].includes(currentTool)) {
      // Text editing tools
      request = {
        type: 'REPHRASE_TEXT',
        text: text,
        action: currentTool,
        context: { tone: toneSelect.value }
      };
    } else {
      // Content generation tools
      request = {
        type: 'GENERATE_CONTENT',
        prompt: text,
        contentType: currentTool,
        context: { tone: toneSelect.value }
      };
    }
    
    const response = await chrome.runtime.sendMessage(request);
    
    if (response.success) {
      const result = response.data.editedText || response.data.content;
      
      // Show result in Tools tab
      displayToolResult(result);
      
      // Store for later use
      currentToolResult = result;
      
      // Hide input, show results
      toolInputSection.classList.add('hidden');
      toolResults.classList.remove('hidden');
    } else {
      showToolStatus(`❌ Error: ${response.error}`);
    }
  } catch (error) {
    console.error('[NeuroSEDA] Tool processing error:', error);
    showToolStatus(`❌ Error: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// Display tool result
function displayToolResult(result) {
  toolResultsContent.textContent = result;
}

// Show tool status message
function showToolStatus(message) {
  const statusDiv = document.createElement('div');
  statusDiv.style.cssText = 'padding: 12px; background: var(--bg-secondary); border-radius: 6px; margin: 12px 0; color: var(--text-secondary);';
  statusDiv.textContent = message;
  toolResultsContent.parentElement.insertBefore(statusDiv, toolResultsContent);
  setTimeout(() => statusDiv.remove(), 3000);
}

// Store current tool result
let currentToolResult = null;

// Insert tool result into page
async function insertToolResult() {
  if (!currentToolResult) {
    showToolStatus('No result to insert');
    return;
  }
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      showToolStatus('⚠️ No active tab found');
      return;
    }
    
    chrome.tabs.sendMessage(tab.id, {
      type: 'INJECT_TEXT',
      text: currentToolResult
    }, (response) => {
      if (response && response.success) {
        showToolStatus('✅ Content inserted into the page!');
        setTimeout(() => {
          toolResults.classList.add('hidden');
          hideToolInput();
        }, 1500);
      } else {
        showToolStatus('⚠️ Could not insert. Make sure a text field is focused on the page.');
      }
    });
  } catch (error) {
    console.error('[NeuroSEDA] Error inserting tool result:', error);
    showToolStatus(`❌ Error: ${error.message}`);
  }
}

// Copy tool result to clipboard
async function copyToolResult() {
  if (!currentToolResult) {
    showToolStatus('No result to copy');
    return;
  }
  
  try {
    await navigator.clipboard.writeText(currentToolResult);
    const originalText = copyToolResultBtn.textContent;
    copyToolResultBtn.textContent = '✓ Copied!';
    setTimeout(() => {
      copyToolResultBtn.textContent = originalText;
    }, 2000);
    showToolStatus('✅ Copied to clipboard!');
  } catch (error) {
    console.error('[NeuroSEDA] Error copying:', error);
    showToolStatus('❌ Copy failed');
  }
}

// Add action buttons for generated content
function addActionButtons(content, tabId) {
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'action-buttons';
  buttonContainer.style.cssText = 'margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;';
  
  const insertBtn = document.createElement('button');
  insertBtn.textContent = '📝 Insert in Page';
  insertBtn.className = 'btn btn-primary';
  insertBtn.onclick = () => {
    chrome.tabs.sendMessage(tabId, {
      type: 'INJECT_TEXT',
      text: content
    }, (response) => {
      if (response && response.success) {
        addMessageToChat('✅ Content inserted into the page!', 'bot');
      } else {
        addMessageToChat('⚠️ Could not insert content. Make sure a text field is focused on the page.', 'bot');
      }
    });
  };
  
  const copyBtn = document.createElement('button');
  copyBtn.textContent = '📋 Copy';
  copyBtn.className = 'btn btn-secondary';
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(content);
    copyBtn.textContent = '✓ Copied!';
    setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 2000);
  };
  
  buttonContainer.appendChild(insertBtn);
  buttonContainer.appendChild(copyBtn);
  
  messagesContainer.appendChild(buttonContainer);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Switch tabs
function switchTab(tabName) {
  currentTab = tabName;

  // Update button states
  tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Update content visibility
  tabContents.forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });
  
  // Load page info when Summary tab is opened
  if (tabName === 'summary') {
    loadPageInfo();
  }
}

// Load current page information
async function loadPageInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    
    // Check if it's a special Chrome page
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:')) {
      if (pageInfo) pageInfo.classList.add('hidden');
      return;
    }
    
    // Try to inject content script if needed
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (injectError) {
      // Script might already be loaded, continue
      console.log('[NeuroSEDA] Content script injection (loadPageInfo):', injectError.message);
    }
    
    // Get page content to show info
    try {
      const pageContentResponse = await chrome.tabs.sendMessage(tab.id, {
        type: 'GET_PAGE_CONTENT'
      });
      
      if (pageContentResponse && pageContentResponse.success && pageContentResponse.content) {
        const pageContent = pageContentResponse.content;
        
        if (pageTitle) pageTitle.textContent = pageContent.title || tab.title || 'Untitled';
        if (pageUrl) pageUrl.textContent = pageContent.url || tab.url;
        if (contentLength) contentLength.textContent = pageContent.length || 0;
        if (pageInfo) pageInfo.classList.remove('hidden');
      }
    } catch (error) {
      // If content script not available, just show tab info
      console.log('[NeuroSEDA] Could not get page content (loadPageInfo):', error.message);
      if (pageTitle) pageTitle.textContent = tab.title || 'Untitled';
      if (pageUrl) pageUrl.textContent = tab.url;
      if (contentLength) contentLength.textContent = 'N/A';
      if (pageInfo) pageInfo.classList.remove('hidden');
    }
  } catch (error) {
    console.log('[NeuroSEDA] Could not load page info:', error);
  }
}

// Show/hide loading spinner
function showLoading(show) {
  loadingSpinner.classList.toggle('hidden', !show);
  sendBtn.disabled = show;
}

// Chat history persistence
function saveChatHistory() {
  chrome.storage.local.set({ chatHistory: chatHistory });
}

function loadChatHistory() {
  chrome.storage.local.get(['chatHistory'], (result) => {
    if (result.chatHistory) {
      chatHistory = result.chatHistory;
      // Display last 5 messages
      const recentMessages = chatHistory.slice(-5);
      messagesContainer.innerHTML = '';
      
      if (recentMessages.length === 0) {
        addMessageToChat('👋 Hello! I\'m your NeuroSEDA AI Assistant. Start by selecting an element and asking me something about it!', 'bot');
      } else {
        recentMessages.forEach(exchange => {
          addMessageToChat(exchange.user, 'user');
          addMessageToChat(exchange.bot, 'bot');
        });
      }
    }
  });
}

// ============================================================================
// PREDICTIONS DEMO FUNCTIONALITY
// ============================================================================

// Predictions Demo Elements
const serviceStatus = document.getElementById('serviceStatus');
const statusText = document.getElementById('statusText');
const demoGmailBtn = document.getElementById('demoGmailBtn');
const demoShoppingBtn = document.getElementById('demoShoppingBtn');
const demoSignupBtn = document.getElementById('demoSignupBtn');
const analyzeLiveBtn = document.getElementById('analyzeLiveBtn');
const clearLiveBtn = document.getElementById('clearLiveBtn');
const predictionsDisplay = document.getElementById('predictionsDisplay');
const predictionsContent = document.getElementById('predictionsContent');

// Initialize predictions demo when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupPredictionsEventListeners();
  checkPredictionServiceStatus();
});

function setupPredictionsEventListeners() {
  if (demoGmailBtn) {
    demoGmailBtn.addEventListener('click', () => showDemoPrediction('gmail'));
  }
  if (demoShoppingBtn) {
    demoShoppingBtn.addEventListener('click', () => showDemoPrediction('shopping'));
  }
  if (demoSignupBtn) {
    demoSignupBtn.addEventListener('click', () => showDemoPrediction('signup'));
  }
  if (analyzeLiveBtn) {
    analyzeLiveBtn.addEventListener('click', analyzeLivePage);
  }
  if (clearLiveBtn) {
    clearLiveBtn.addEventListener('click', clearPredictions);
  }
}

// Check if prediction service is running
async function checkPredictionServiceStatus() {
  if (!serviceStatus || !statusText) return;
  
  try {
    const response = await fetch('http://localhost:5000/health');
    if (response.ok) {
      serviceStatus.style.background = 'rgba(76, 175, 80, 0.1)';
      serviceStatus.style.borderColor = 'rgba(76, 175, 80, 0.3)';
      statusText.textContent = '🟢 Service Running';
    } else {
      throw new Error('Service not responding');
    }
  } catch (error) {
    serviceStatus.style.background = 'rgba(244, 67, 54, 0.1)';
    serviceStatus.style.borderColor = 'rgba(244, 67, 54, 0.3)';
    statusText.textContent = '🔴 Service Offline (Start python backend on localhost:5000)';
  }
}

// Show demo predictions for different scenarios
function showDemoPrediction(scenario) {
  let demoData;
  
  switch (scenario) {
    case 'gmail':
      demoData = {
        title: 'Gmail Compose Scenario',
        context: 'User is composing an email in Gmail',
        predictions: [
          {
            rank: 1,
            text: 'Send button',
            action: 'click',
            confidence: 89,
            reason: 'User has typed email content, likely to send next'
          },
          {
            rank: 2,
            text: 'Attach files button',
            action: 'click',
            confidence: 72,
            reason: 'Common action before sending important emails'
          },
          {
            rank: 3,
            text: 'CC/BCC field',
            action: 'click',
            confidence: 58,
            reason: 'User might want to add more recipients'
          }
        ]
      };
      break;
      
    case 'shopping':
      demoData = {
        title: 'E-commerce Shopping Cart',
        context: 'User has items in shopping cart',
        predictions: [
          {
            rank: 1,
            text: 'Proceed to Checkout',
            action: 'click',
            confidence: 94,
            reason: 'High intent to purchase based on cart interaction'
          },
          {
            rank: 2,
            text: 'Update quantity',
            action: 'input',
            confidence: 67,
            reason: 'Users often adjust quantities before checkout'
          },
          {
            rank: 3,
            text: 'Remove item',
            action: 'click',
            confidence: 45,
            reason: 'Some users reconsider items in cart'
          }
        ]
      };
      break;
      
    case 'signup':
      demoData = {
        title: 'User Registration Form',
        context: 'User filling out signup form',
        predictions: [
          {
            rank: 1,
            text: 'Email field',
            action: 'input',
            confidence: 87,
            reason: 'Next required field in form sequence'
          },
          {
            rank: 2,
            text: 'Password field',
            action: 'input',
            confidence: 82,
            reason: 'Follows email in typical form flow'
          },
          {
            rank: 3,
            text: 'Terms checkbox',
            action: 'toggle',
            confidence: 71,
            reason: 'Required before form submission'
          }
        ]
      };
      break;
  }
  
  displayPredictionResults(demoData);
}

// Analyze live page predictions
async function analyzeLivePage() {
  if (!predictionsDisplay || !predictionsContent) return;
  
  try {
    // Show loading
    predictionsContent.innerHTML = '<div style="text-align: center; padding: 20px;"><div class="spinner" style="width: 20px; height: 20px; border: 2px solid #ddd; border-top: 2px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>Analyzing page...</div>';
    predictionsDisplay.style.display = 'block';
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error('No active tab');
    
    console.log('[NeuroSEDA] Analyzing tab:', tab.id, tab.title);
    
    // Get page elements
    const elementResponse = await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'GET_PAGE_ELEMENTS'
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
    
    console.log('[NeuroSEDA] Got elements response:', elementResponse);
    
    if (elementResponse && elementResponse.success && elementResponse.elements) {
      console.log('[NeuroSEDA] Found', elementResponse.elements.length, 'elements, sending to prediction service');
      
      // Send to prediction service
      const predictions = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'PREDICT_NEXT_ELEMENT',
          currentElement: elementResponse.elements[0] || {},
          allElements: elementResponse.elements,
          instruction: 'Predict the next element the user will interact with'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('[NeuroSEDA] Message error:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            console.log('[NeuroSEDA] Received predictions response:', response);
            resolve(response);
          }
        });
      });
      
      if (predictions && predictions.success && predictions.data) {
        console.log('[NeuroSEDA] Displaying', predictions.data.length, 'predictions');
        displayPredictionResults({
          title: 'Live Page Analysis',
          context: `Analyzed ${elementResponse.elements.length} interactive elements on ${tab.title}`,
          predictions: predictions.data
        });
      } else if (predictions && predictions.data && Array.isArray(predictions.data)) {
        // Handle case where success flag might not be set but data is present
        console.log('[NeuroSEDA] Displaying predictions (no success flag):', predictions.data.length);
        displayPredictionResults({
          title: 'Live Page Analysis',
          context: `Analyzed ${elementResponse.elements.length} interactive elements on ${tab.title}`,
          predictions: predictions.data
        });
      } else {
        throw new Error(`Invalid predictions response: ${JSON.stringify(predictions)}`);
      }
    } else {
      throw new Error('Could not analyze page elements: ' + JSON.stringify(elementResponse));
    }
    
  } catch (error) {
    console.error('[NeuroSEDA] Live analysis error:', error);
    predictionsContent.innerHTML = `
      <div style="color: #f44336; padding: 20px; text-align: center;">
        <strong>❌ Analysis Failed</strong><br>
        <small>${error.message}</small><br><br>
        <em>Make sure:</em><br>
        • Page is fully loaded<br>
        • Prediction service is running<br>
        • Page has interactive elements
      </div>
    `;
  }
}

// Display prediction results
function displayPredictionResults(data) {
  if (!predictionsDisplay || !predictionsContent) return;
  
  let html = `
    <div style="margin-bottom: 16px;">
      <h4 style="margin: 0 0 4px 0; color: var(--primary-color);">${data.title}</h4>
      <p style="margin: 0; font-size: 11px; color: var(--text-secondary);">${data.context}</p>
    </div>
  `;
  
  if (data.predictions && data.predictions.length > 0) {
    data.predictions.forEach((pred, index) => {
      const confidenceColor = getConfidenceColor(pred.confidence);
      const actionEmoji = getActionEmoji(pred.action);
      const predId = `pred-item-${index}`;
      
      html += `
        <div class="prediction-item" id="${predId}" style="
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold; color: var(--primary-color);">#${pred.rank || (index + 1)}</span>
              <span style="font-size: 14px;">${actionEmoji}</span>
              <strong style="font-size: 13px;">${pred.text.substring(0, 40)}${pred.text.length > 40 ? '...' : ''}</strong>
            </div>
            <span style="
              background: ${confidenceColor};
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: bold;
            ">${pred.confidence}%</span>
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">
            <strong>Action:</strong> ${pred.action}
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.3;">
            <strong>Reasoning:</strong> ${pred.reason}
          </div>
        </div>
      `;
    });
  } else {
    html += `
      <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
        <p>No predictions available for this scenario.</p>
      </div>
    `;
  }
  
  predictionsContent.innerHTML = html;
  predictionsDisplay.style.display = 'block';
  
  // Add hover effects via JavaScript (CSP compliant)
  document.querySelectorAll('.prediction-item').forEach(item => {
    item.addEventListener('mouseover', function() {
      this.style.borderColor = 'var(--primary-color)';
    });
    item.addEventListener('mouseout', function() {
      this.style.borderColor = 'var(--border-color)';
    });
  });
}

// Helper functions for predictions display
function getConfidenceColor(confidence) {
  if (confidence >= 80) return '#4CAF50';
  if (confidence >= 60) return '#FF9800';
  if (confidence >= 40) return '#FF5722';
  return '#F44336';
}

function getActionEmoji(action) {
  const emojiMap = {
    'click': '🖱️',
    'input': '⌨️',
    'select': '📝',
    'toggle': '✅',
    'scroll': '⬇️',
    'hover': '👆',
    'submit': '📤'
  };
  return emojiMap[action] || '👆';
}

// Clear predictions display
function clearPredictions() {
  if (predictionsDisplay) {
    predictionsDisplay.style.display = 'none';
  }
  if (predictionsContent) {
    predictionsContent.innerHTML = '';
  }
}

// ============================================================================
// WEBPAGE SUMMARIZATION FUNCTIONS
// ============================================================================

// Generate webpage summary
async function generateWebpageSummary() {
  if (!generateSummaryBtn || !summaryDisplay || !summaryContent) return;
  
  const startTime = Date.now();
  
  try {
    // Show loading state
    summaryLoading.classList.remove('hidden');
    summaryDisplay.classList.add('hidden');
    summaryError.classList.add('hidden');
    generateSummaryBtn.disabled = true;
    generateSummaryBtn.style.opacity = '0.6';
    
    // Update loading message
    updateLoadingMessage('Preparing to analyze page...');
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      throw new Error('No active tab found');
    }
    
    // Check if it's a special Chrome page
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:')) {
      throw new Error('Cannot summarize Chrome special pages. Please open a regular webpage.');
    }
    
    // Check if URL is valid for content scripts
    if (!tab.url.startsWith('http://') && !tab.url.startsWith('https://')) {
      throw new Error('Cannot summarize this page type. Please open a regular webpage (http:// or https://).');
    }
    
    console.log('[NeuroSEDA] Generating summary for:', tab.url);
    updateLoadingMessage('Extracting page content...');
    
    // Try to inject content script if not already loaded
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      console.log('[NeuroSEDA] Content script injected');
      // Wait a bit for script to initialize
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (injectError) {
      console.log('[NeuroSEDA] Content script injection attempt:', injectError.message);
      // Continue anyway - script might already be loaded or URL might not support injection
    }
    
    // Get page content from content script with retry logic
    let pageContentResponse = null;
    let retries = 3;
    let lastError = null;
    
    while (retries > 0 && !pageContentResponse) {
      try {
        pageContentResponse = await chrome.tabs.sendMessage(tab.id, {
          type: 'GET_PAGE_CONTENT'
        });
        
        if (pageContentResponse && pageContentResponse.success) {
          break;
        }
      } catch (error) {
        lastError = error;
        console.log(`[NeuroSEDA] Message send failed, retries left: ${retries - 1}`, error);
        
        if (error.message && error.message.includes('Receiving end does not exist')) {
          // Try injecting script again
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            });
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (injectErr) {
            console.log('[NeuroSEDA] Script injection retry failed:', injectErr);
          }
        }
        
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    if (!pageContentResponse || !pageContentResponse.success) {
      if (lastError) {
        if (lastError.message.includes('Receiving end does not exist')) {
          throw new Error('Content script not available. Please refresh the page and try again, or make sure you\'re on a regular webpage (not a Chrome internal page).');
        }
        throw new Error(`Could not connect to page: ${lastError.message}`);
      }
      throw new Error('Could not extract page content. Make sure the page is fully loaded.');
    }
    
    const pageContent = pageContentResponse.content;
    
    // Update page info
    if (pageInfo && pageTitle && pageUrl && contentLength) {
      pageTitle.textContent = pageContent.title || 'Untitled';
      pageUrl.textContent = pageContent.url || tab.url;
      contentLength.textContent = pageContent.length || 0;
      pageInfo.classList.remove('hidden');
    }
    
    // Check if content is too short
    if (!pageContent.content || pageContent.content.trim().length < 50) {
      throw new Error('Page content is too short to summarize. The page may not have enough text content.');
    }
    
    console.log('[NeuroSEDA] Page content extracted:', pageContent.length, 'characters');
    const extractionTime = ((Date.now() - startTime) / 1000).toFixed(1);
    updateLoadingMessage(`Content extracted (${extractionTime}s). Generating AI summary...`);
    
    // Send to background script for summarization with timeout
    const summaryPromise = chrome.runtime.sendMessage({
      type: 'SUMMARIZE_PAGE',
      pageContent: pageContent
    });
    
    // Add timeout (30 seconds for API call)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Summary generation timed out after 30 seconds. Please try again.')), 30000);
    });
    
    const summaryResponse = await Promise.race([summaryPromise, timeoutPromise]);
    
    if (!summaryResponse || !summaryResponse.success) {
      const errorMsg = summaryResponse?.error || 'Failed to generate summary';
      
      // If it's an API key error, provide helpful message
      if (errorMsg.includes('API key not configured')) {
        throw new Error('API key not configured. Click "Open Settings" below to set your Gemini API key.');
      }
      
      throw new Error(errorMsg);
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[NeuroSEDA] Summary generated in ${totalTime} seconds`);
    
    const summary = summaryResponse.data.summary;
    currentSummary = summary;
    
    // Display summary
    summaryContent.innerHTML = formatMessage(summary);
    summaryDisplay.classList.remove('hidden');
    summaryLoading.classList.add('hidden');
    
    // Show refresh button
    if (refreshSummaryBtn) {
      refreshSummaryBtn.classList.remove('hidden');
    }
    
    console.log('[NeuroSEDA] Summary generated successfully');
    
  } catch (error) {
    console.error('[NeuroSEDA] Error generating summary:', error);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Show error
    summaryLoading.classList.add('hidden');
    summaryDisplay.classList.add('hidden');
    summaryError.classList.remove('hidden');
    
    // Create error message with action button if it's an API key error
    if (error.message.includes('API key not configured') || 
        error.message.includes('Open Settings') ||
        error.message.includes('API key is invalid') ||
        error.message.includes('invalid API key')) {
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div style="margin-bottom: 12px;">
          <strong>❌ ${error.message.includes('invalid') ? 'Invalid API Key' : 'API Key Error'}</strong>
        </div>
        <div style="margin-bottom: 12px; font-size: 13px; line-height: 1.5;">
          ${error.message.includes('invalid') 
            ? 'Your API key appears to be invalid or expired. Please verify it\'s correct.'
            : error.message}
        </div>
        <button id="openSettingsBtn" style="
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          width: 100%;
          margin-bottom: 8px;
        ">⚙️ Open Settings</button>
        <div style="font-size: 12px; color: var(--text-secondary);">
          <strong>How to fix:</strong>
          <ol style="margin: 8px 0; padding-left: 20px; text-align: left;">
            <li>Get a valid API key from <a href="https://aistudio.google.com" target="_blank" style="color: var(--primary-color);">Google AI Studio</a></li>
            <li>Make sure you copy the entire key (usually starts with "AIza...")</li>
            <li>Paste it in Settings → Gemini API Key</li>
            <li>Click "Save Settings"</li>
          </ol>
        </div>
      `;
      summaryError.innerHTML = '';
      summaryError.appendChild(errorDiv);
      
      // Add click handler for settings button
      document.getElementById('openSettingsBtn').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
      });
    } 
    // Handle quota errors with helpful information
    else if (error.message.includes('quota') || error.message.includes('Quota exceeded')) {
      const retryMatch = error.message.match(/Please retry in ([\d.]+)s/);
      const retrySeconds = retryMatch ? parseFloat(retryMatch[1]) : null;
      const retryMinutes = retrySeconds ? Math.ceil(retrySeconds / 60) : null;
      
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div style="margin-bottom: 12px;">
          <strong>⚠️ API Quota Exceeded</strong>
        </div>
        <div style="margin-bottom: 12px; font-size: 13px; line-height: 1.5;">
          ${retrySeconds ? `You've reached the free tier limit. Please wait ${retryMinutes ? `about ${retryMinutes} minute${retryMinutes > 1 ? 's' : ''}` : `${Math.ceil(retrySeconds)} seconds`} before trying again.` : 'You\'ve reached the free tier quota limit for Gemini API.'}
        </div>
        <div style="margin-bottom: 12px; font-size: 12px; color: var(--text-secondary);">
          <strong>Options:</strong>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>Wait for the quota to reset (usually daily)</li>
            <li>Upgrade to a paid plan for higher limits</li>
            <li>Check your usage at <a href="https://ai.dev/rate-limit" target="_blank" style="color: var(--primary-color);">ai.dev/rate-limit</a></li>
          </ul>
        </div>
        ${retrySeconds ? `<div style="font-size: 11px; color: var(--text-secondary);">
          Retry after: ${Math.ceil(retrySeconds)} seconds
        </div>` : ''}
      `;
      summaryError.innerHTML = '';
      summaryError.appendChild(errorDiv);
    } 
    else {
      summaryError.textContent = `❌ Error: ${error.message}`;
    }
    
  } finally {
    // Re-enable button
    if (generateSummaryBtn) {
      generateSummaryBtn.disabled = false;
      generateSummaryBtn.style.opacity = '1';
    }
  }
}

// Update loading message
function updateLoadingMessage(message) {
  const loadingText = summaryLoading.querySelector('p');
  if (loadingText) {
    loadingText.textContent = message;
  }
}

console.log('[NeuroSEDA] Sidebar loaded successfully');
