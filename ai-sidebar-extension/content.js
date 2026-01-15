// Content script for NeuroSEDA AI Sidebar
let isElementSelectionMode = false;
let selectedElement = null;
let originalElement = null;
let selectedText = null;

// Listen for text selection on page
function handleTextSelection() {
  try {
    const selection = window.getSelection();
    
    // Check if selection is valid and has content
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    
    const selectedText = selection.toString().trim();
    
    // Only proceed if text is long enough (minimum 3 characters)
    if (selectedText && selectedText.length > 3) {
      console.log('[NeuroSEDA] Valid text selected:', selectedText.substring(0, 50));
      showSelectionMenu(selectedText, selection);
    }
    // Silently ignore short selections
  } catch (error) {
    console.error('[NeuroSEDA] Error in text selection:', error);
  }
}

// Show floating menu for selected text
function showSelectionMenu(text, selection) {
  try {
    // Remove existing menu if any
    const existingMenu = document.getElementById('neuro-selection-menu');
    if (existingMenu) {
      console.log('[NeuroSEDA] Removing existing menu');
      existingMenu.remove();
    }
    
    // Get selection bounds
    if (selection.rangeCount === 0) {
      console.log('[NeuroSEDA] No range available for menu positioning');
      return;
    }
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    console.log('[NeuroSEDA] Menu position:', { top: rect.bottom, left: rect.left });
    
    // Create menu
    const menu = document.createElement('div');
    menu.id = 'neuro-selection-menu';
    menu.style.cssText = `
      position: fixed;
      top: ${Math.max(0, rect.bottom + window.scrollY + 10)}px;
      left: ${Math.max(0, rect.left + window.scrollX)}px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: slideUp 0.2s ease;
      border: none;
    `;
    
    menu.textContent = '🧠 Add to NeuroSEDA';
    menu.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[NeuroSEDA] Menu clicked, sending text');
      sendSelectedText(text);
      menu.remove();
    });
    
    // Append to body
    if (document.body) {
      document.body.appendChild(menu);
      console.log('[NeuroSEDA] Menu appended to DOM');
    } else {
      console.error('[NeuroSEDA] document.body not available');
      return;
    }
    
    // Remove menu after 6 seconds
    setTimeout(() => {
      const menuToRemove = document.getElementById('neuro-selection-menu');
      if (menuToRemove) {
        console.log('[NeuroSEDA] Auto-removing menu after timeout');
        menuToRemove.remove();
      }
    }, 6000);
    
  } catch (error) {
    console.error('[NeuroSEDA] Error showing menu:', error);
  }
}

// Send selected text to sidebar
function sendSelectedText(text) {
  try {
    console.log('[NeuroSEDA] Starting sendSelectedText with text length:', text.length);
    
    // Check if extension context is still valid
    if (!isExtensionContextValid()) {
      console.error('[NeuroSEDA] Extension context no longer available');
      return;
    }
    
    selectedText = text;
    
    // Get parent element info
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) {
      console.error('[NeuroSEDA] No selection anchor node');
      return;
    }
    
    const element = selection.anchorNode.parentElement || document.body;
    
    const elementData = {
      tag: element.tagName || 'TEXT',
      text: text,
      html: text,
      classes: element.className || '',
      id: element.id || '',
      attributes: getElementAttributes(element),
      source: 'text_selection'
    };
    
    console.log('[NeuroSEDA] Element data prepared:', elementData);
    
    // Send to background script with error handling
    try {
      chrome.runtime.sendMessage({
        type: 'ELEMENT_SELECTED',
        element: elementData
      }, (response) => {
        // Check for extension context errors
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message.includes('context invalidated')) {
            console.warn('[NeuroSEDA] Extension reloaded, please try again');
          } else {
            console.error('[NeuroSEDA] Send message error:', chrome.runtime.lastError.message);
          }
        } else if (response) {
          console.log('[NeuroSEDA] Text sent to background successfully');
        }
      });
    } catch (err) {
      if (err.message.includes('context invalidated')) {
        console.warn('[NeuroSEDA] Extension context invalidated - extension may have been reloaded');
      } else {
        console.error('[NeuroSEDA] Extension context error:', err);
      }
    }
    
    // Open sidebar with delay to allow message to be processed
    setTimeout(() => {
      try {
        // Verify extension still exists
        if (!isExtensionContextValid()) {
          console.error('[NeuroSEDA] Extension context lost');
          return;
        }
        
        console.log('[NeuroSEDA] Sending OPEN_SIDEPANEL message');
        chrome.runtime.sendMessage({
          type: 'OPEN_SIDEPANEL'
        }, (response) => {
          if (chrome.runtime.lastError) {
            if (chrome.runtime.lastError.message.includes('context invalidated')) {
              console.warn('[NeuroSEDA] Extension reloaded, sidebar cannot be opened');
            }
          } else {
            console.log('[NeuroSEDA] Sidebar open request sent');
          }
        });
      } catch (err) {
        if (err.message.includes('context invalidated')) {
          console.warn('[NeuroSEDA] Extension context invalidated while opening sidebar');
        } else {
          console.error('[NeuroSEDA] Error opening sidebar:', err);
        }
      }
    }, 100);
    
  } catch (error) {
    console.error('[NeuroSEDA] Error in sendSelectedText:', error);
  }
}

// Check if extension context is valid
function isExtensionContextValid() {
  try {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  } catch (e) {
    return false;
  }
}

// Listen for messages from background or sidebar
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Check context validity at start
    if (!isExtensionContextValid()) {
      console.warn('[NeuroSEDA] Extension context invalid at message start');
      try {
        sendResponse({ success: false, error: 'Extension context invalid' });
      } catch (e) {
        // Already invalid, ignore
      }
      return true;
    }

    try {
      if (request.type === 'TOGGLE_SELECTION_MODE') {
        toggleElementSelectionMode(request.enabled);
        sendResponse({ success: true });
      }
      else if (request.type === 'GET_PAGE_CONTEXT') {
        sendResponse({
          success: true,
          context: {
            url: window.location.href,
            title: document.title,
            description: getPageDescription()
          }
        });
      }
      else if (request.type === 'GET_SELECTED_ELEMENT') {
        if (selectedElement) {
          sendResponse({
            success: true,
            element: {
              tag: selectedElement.tagName,
              text: selectedElement.innerText?.substring(0, 500) || '',
              html: selectedElement.outerHTML.substring(0, 1000) || '',
              classes: selectedElement.className,
              id: selectedElement.id,
              attributes: getElementAttributes(selectedElement)
            }
          });
        } else {
          sendResponse({ success: false, error: 'No element selected' });
        }
      }
      else if (request.type === 'CLEAR_SELECTION') {
        clearSelection();
        sendResponse({ success: true });
      }
      else if (request.type === 'INJECT_TEXT') {
        const success = injectTextIntoElement(request.text, request.elementIndex);
        sendResponse({ success: success });
      }
      else if (request.type === 'REPLACE_TEXT') {
        const success = replaceSelectedText(request.text);
        sendResponse({ success: success });
      }
      else if (request.type === 'APPEND_TEXT') {
        const success = appendTextToElement(request.text, request.elementIndex);
        sendResponse({ success: success });
      }
      else if (request.type === 'SHOW_TEXT_POPUP') {
        console.log('[NeuroSEDA] Showing text popup with action:', request.action);
        showTextActionPopup(request.selectedText, request.action);
        sendResponse({ success: true });
        return true;
      }
      else if (request.type === 'GET_PAGE_ELEMENTS') {
        console.log('[NeuroSEDA] Getting page elements for prediction analysis');
        const elements = getPageElements();
        sendResponse({ success: true, elements: elements });
      }
      else if (request.type === 'GET_PAGE_CONTENT') {
        console.log('[NeuroSEDA] Getting page content for summarization');
        const pageContent = getPageContent();
        sendResponse({ success: true, content: pageContent });
      }
      else {
        console.warn('[NeuroSEDA] Unknown message type:', request.type);
        sendResponse({ success: false, error: `Unknown message type: ${request.type}` });
      }
    } catch (error) {
      console.error('[NeuroSEDA] Error in message listener:', error);
      
      // Verify context is still valid before sending response
      if (isExtensionContextValid()) {
        try {
          if (error.message && error.message.includes('context invalidated')) {
            console.warn('[NeuroSEDA] Extension context invalidated during message processing');
            sendResponse({ success: false, error: 'Extension context invalidated' });
          } else {
            sendResponse({ success: false, error: error.message });
          }
        } catch (e) {
          console.error('[NeuroSEDA] Could not send error response:', e);
        }
      } else {
        console.warn('[NeuroSEDA] Context became invalid, cannot send response');
      }
    }
    return true;
  });
}

// Toggle element selection mode
function toggleElementSelectionMode(enabled) {
  isElementSelectionMode = enabled;

  if (enabled) {
    // Add event listeners
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleElementClick, true);
    
    // Show visual indicator
    const indicator = document.createElement('div');
    indicator.id = 'neuro-selector-indicator';
    indicator.textContent = '🎯 Element Selection Mode - Click to select an element';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      animation: pulse 2s infinite;
    `;
    document.body.appendChild(indicator);
    
    // Add CSS for animation
    if (!document.getElementById('neuro-selector-styles')) {
      const style = document.createElement('style');
      style.id = 'neuro-selector-styles';
      style.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes highlight {
          0% { box-shadow: inset 0 0 0 2px rgba(102, 126, 234, 0.3); }
          100% { box-shadow: inset 0 0 0 3px rgba(102, 126, 234, 0.8); }
        }
        .neuro-element-highlight {
          animation: highlight 0.6s ease-in-out !important;
          outline: 2px dashed #667eea !important;
          outline-offset: 2px !important;
        }
      `;
      document.head.appendChild(style);
    }
  } else {
    // Remove event listeners
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('mouseout', handleMouseOut, true);
    document.removeEventListener('click', handleElementClick, true);
    
    // Remove indicator
    const indicator = document.getElementById('neuro-selector-indicator');
    if (indicator) indicator.remove();
    
    // Clear selection
    clearSelection();
  }
}

// Handle mouse over elements
function handleMouseOver(e) {
  if (!isElementSelectionMode) return;
  
  const element = e.target;
  if (element && element !== document.body && element !== document.documentElement) {
    if (originalElement) {
      originalElement.classList.remove('neuro-element-highlight');
    }
    
    element.classList.add('neuro-element-highlight');
    originalElement = element;
  }
}

// Handle mouse out
function handleMouseOut(e) {
  if (!isElementSelectionMode) return;
  
  const element = e.target;
  if (element && element !== selectedElement) {
    element.classList.remove('neuro-element-highlight');
  }
}

// Handle element click
function handleElementClick(e) {
  if (!isElementSelectionMode) return;
  
  // Check if extension context is still valid
  if (!isExtensionContextValid()) {
    console.error('[NeuroSEDA] Extension context not available');
    return;
  }
  
  e.preventDefault();
  e.stopPropagation();
  
  const element = e.target;
  
  // Clear previous selection
  if (selectedElement) {
    selectedElement.classList.remove('neuro-element-highlight');
  }
  
  // Set new selection
  selectedElement = element;
  selectedElement.classList.add('neuro-element-highlight');
  
  // Extract text from element (handle buttons, inputs, etc.)
  const elementText = getElementText(element);
  
  console.log('[NeuroSEDA] Element clicked:', {
    tag: element.tagName,
    text: elementText,
    innerText: element.innerText,
    textContent: element.textContent,
    value: element.value
  });
  
  // Send selection to sidebar with error handling
  try {
    chrome.runtime.sendMessage({
      type: 'ELEMENT_SELECTED',
      element: {
        tag: element.tagName,
        text: elementText,
        html: element.outerHTML.substring(0, 1000) || '',
        classes: element.className,
        id: element.id,
        attributes: getElementAttributes(element),
        bbox: getBoundingBox(element),
        idx: getElementIndex(element)
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        if (chrome.runtime.lastError.message.includes('context invalidated')) {
          console.warn('[NeuroSEDA] Extension context invalidated after element click');
        }
      }
    });
  } catch (err) {
    if (err.message && err.message.includes('context invalidated')) {
      console.warn('[NeuroSEDA] Extension reloaded - please reload page and try again');
    } else {
      console.error('[NeuroSEDA] Error sending element selection:', err);
    }
  }
}

// Helper function to extract text from any element
function getElementText(element) {
  // Try different text sources in order of preference
  if (element.innerText && element.innerText.trim()) {
    return element.innerText.trim().substring(0, 500);
  }
  if (element.textContent && element.textContent.trim()) {
    return element.textContent.trim().substring(0, 500);
  }
  if (element.value && element.value.trim()) {
    return element.value.trim().substring(0, 500);
  }
  if (element.placeholder && element.placeholder.trim()) {
    return element.placeholder.trim().substring(0, 500);
  }
  if (element.title && element.title.trim()) {
    return element.title.trim().substring(0, 500);
  }
  if (element.getAttribute('aria-label')) {
    return element.getAttribute('aria-label').substring(0, 500);
  }
  if (element.getAttribute('data-text')) {
    return element.getAttribute('data-text').substring(0, 500);
  }
  // Last resort: use tag name
  return element.tagName.toLowerCase();
}

// Get bounding box for element (for prediction model)
function getBoundingBox(element) {
  const rect = element.getBoundingClientRect();
  return [rect.left / window.innerWidth, rect.top / window.innerHeight, 
          rect.right / window.innerWidth, rect.bottom / window.innerHeight];
}

// Get element index in DOM (for prediction model)
function getElementIndex(element) {
  let index = 0;
  let sibling = element.previousElementSibling;
  while (sibling) {
    index++;
    sibling = sibling.previousElementSibling;
  }
  return index;
}

// ============================================================================
// TEXT INSERTION & PAGE EDITING FUNCTIONS
// ============================================================================

// Inject text into form fields, textareas, contenteditable divs
function injectTextIntoElement(text, elementIndex = null) {
  try {
    let targetElement = null;
    
    // If specific element index provided, find it
    if (elementIndex !== null) {
      const allTextInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea, [contenteditable="true"]');
      if (allTextInputs[elementIndex]) {
        targetElement = allTextInputs[elementIndex];
      }
    } else {
      // Try to find focused element
      targetElement = document.activeElement;
      
      // Check if it's a valid text input
      if (!isTextInput(targetElement)) {
        // Try to find any visible text input
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea, [contenteditable="true"]');
        if (inputs.length > 0) {
          targetElement = inputs[0];
        }
      }
    }
    
    if (!targetElement) {
      console.error('[NeuroSEDA] No text input element found to inject text');
      return false;
    }
    
    // Focus the element
    targetElement.focus();
    
    // Inject text based on element type
    if (targetElement.tagName === 'TEXTAREA' || targetElement.type === 'text' || targetElement.type === 'email' || targetElement.type === 'password') {
      // For regular inputs and textareas
      const startPos = targetElement.selectionStart || 0;
      const endPos = targetElement.selectionEnd || targetElement.value.length;
      
      const beforeText = targetElement.value.substring(0, startPos);
      const afterText = targetElement.value.substring(endPos);
      
      targetElement.value = beforeText + text + afterText;
      
      // Update cursor position
      const newPos = startPos + text.length;
      targetElement.selectionStart = newPos;
      targetElement.selectionEnd = newPos;
    } else if (targetElement.contentEditable === 'true') {
      // For contenteditable divs (like Gmail compose)
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      
      // Move cursor after inserted text
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Trigger input event to notify page of change
    const event = new Event('input', { bubbles: true });
    targetElement.dispatchEvent(event);
    
    const changeEvent = new Event('change', { bubbles: true });
    targetElement.dispatchEvent(changeEvent);
    
    console.log('[NeuroSEDA] Text injected successfully');
    return true;
  } catch (error) {
    console.error('[NeuroSEDA] Error injecting text:', error);
    return false;
  }
}

// Store selected text range
let storedRange = null;
let storedText = null;

// Store selection when showing popup
function storeSelection() {
  try {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      storedRange = selection.getRangeAt(0).cloneRange();
      storedText = selection.toString();
      console.log('[NeuroSEDA] Selection stored:', storedText.substring(0, 50));
      return true;
    }
  } catch (error) {
    console.error('[NeuroSEDA] Error storing selection:', error);
  }
  return false;
}

// Replace selected text using stored range
function replaceSelectedText(newText) {
  try {
    // Use stored range if available
    if (storedRange) {
      console.log('[NeuroSEDA] Using stored range to replace text');
      
      // Restore the range and delete the old content
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(storedRange);
      
      // Delete the selected content
      storedRange.deleteContents();
      
      // Create and insert new text
      const textNode = document.createTextNode(newText);
      storedRange.insertNode(textNode);
      
      // Move cursor after new text
      storedRange.setStartAfter(textNode);
      storedRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(storedRange);
      
      // Clear stored range
      storedRange = null;
      storedText = null;
      
      console.log('[NeuroSEDA] Text replaced successfully using stored range');
      return true;
    } else {
      // Fallback: try current selection
      const selection = window.getSelection();
      
      if (!selection.toString()) {
        console.warn('[NeuroSEDA] No text selected and no stored range - cannot replace');
        return false;
      }
      
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const textNode = document.createTextNode(newText);
      range.insertNode(textNode);
      
      // Move cursor after new text
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      console.log('[NeuroSEDA] Text replaced successfully using current selection');
      return true;
    }
  } catch (error) {
    console.error('[NeuroSEDA] Error replacing text:', error);
    return false;
  }
}

// Append text to element
function appendTextToElement(text, elementIndex = null) {
  try {
    let targetElement = document.activeElement;
    
    if (elementIndex !== null) {
      const allInputs = document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]');
      if (allInputs[elementIndex]) {
        targetElement = allInputs[elementIndex];
      }
    }
    
    if (!isTextInput(targetElement)) {
      console.error('[NeuroSEDA] Target element is not a text input');
      return false;
    }
    
    targetElement.focus();
    
    if (targetElement.tagName === 'TEXTAREA' || targetElement.type === 'text') {
      targetElement.value += text;
    } else if (targetElement.contentEditable === 'true') {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
    }
    
    // Trigger events
    targetElement.dispatchEvent(new Event('input', { bubbles: true }));
    targetElement.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('[NeuroSEDA] Text appended successfully');
    return true;
  } catch (error) {
    console.error('[NeuroSEDA] Error appending text:', error);
    return false;
  }
}

// Check if element is a text input
function isTextInput(element) {
  if (!element) return false;
  
  const textInputTypes = ['text', 'email', 'password', 'search', 'tel', 'url'];
  
  return (element.tagName === 'TEXTAREA' ||
          (element.tagName === 'INPUT' && textInputTypes.includes(element.type)) ||
          element.contentEditable === 'true');
}

// ============================================================================
// FLOATING POPUP & TEXT ACTIONS
// ============================================================================

// Show floating popup for text actions
function showTextActionPopup(selectedText, action) {
  try {
    console.log('[NeuroSEDA] Showing text action popup:', action, 'Text:', selectedText.substring(0, 50));
    
    // Store the current selection before popup takes focus
    storeSelection();
    
    // Remove existing popup
    const existingPopup = document.getElementById('neuro-text-action-popup');
    if (existingPopup) {
      existingPopup.remove();
    }
    
    // Create popup container
    const popup = document.createElement('div');
    popup.id = 'neuro-text-action-popup';
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      padding: 24px;
      max-width: 500px;
      width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Popup content
    const actionName = action === 'fix-grammar' ? 'Fix Grammar' : 
                       action.charAt(0).toUpperCase() + action.slice(1);
    
    popup.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${actionName}</h3>
        <button id="neuro-close-popup" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        ">&times;</button>
      </div>
      
      <div style="
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;
        max-height: 150px;
        overflow-y: auto;
        font-size: 13px;
        line-height: 1.5;
      ">${escapeHtml(selectedText)}</div>
      
      <div id="neuro-popup-result" style="
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;
        display: none;
        max-height: 200px;
        overflow-y: auto;
        font-size: 13px;
        line-height: 1.5;
      "></div>
      
      <div id="neuro-popup-loading" style="
        text-align: center;
        display: none;
        padding: 16px;
      ">
        <div style="
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 8px;
        "></div>
        <p style="margin: 0; font-size: 12px;">Processing...</p>
      </div>
      
      <div style="display: flex; gap: 8px;">
        <button id="neuro-popup-apply" style="
          flex: 1;
          background: rgba(255,255,255,0.9);
          color: #667eea;
          border: none;
          padding: 10px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        ">Apply</button>
        <button id="neuro-popup-cancel" style="
          flex: 1;
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 10px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        ">Cancel</button>
      </div>
      
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    document.body.appendChild(popup);
    
    // Event listeners
    const closeBtn = document.getElementById('neuro-close-popup');
    const applyBtn = document.getElementById('neuro-popup-apply');
    const cancelBtn = document.getElementById('neuro-popup-cancel');
    const resultDiv = document.getElementById('neuro-popup-result');
    const loadingDiv = document.getElementById('neuro-popup-loading');
    
    closeBtn.addEventListener('click', () => popup.remove());
    cancelBtn.addEventListener('click', () => popup.remove());
    
    // Process the text
    processTextAction(selectedText, action, loadingDiv, resultDiv, applyBtn, popup);
    
  } catch (error) {
    console.error('[NeuroSEDA] Error showing popup:', error);
  }
}

// Process text action through background
async function processTextAction(text, action, loadingDiv, resultDiv, applyBtn, popup) {
  try {
    loadingDiv.style.display = 'block';
    applyBtn.disabled = true;
    applyBtn.style.opacity = '0.6';
    
    // Verify extension context
    if (!isExtensionContextValid()) {
      loadingDiv.innerHTML = '<p style="color: #ff6b6b; margin: 0;">Extension context lost</p>';
      return;
    }
    
    // Send to background for AI processing with proper error handling
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'REPHRASE_TEXT',
        text: text,
        action: action,
        context: { tone: 'professional' }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[NeuroSEDA] Message error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response) {
          resolve(response);
        } else {
          reject(new Error('No response from background'));
        }
      });
    });
    
    if (response.success) {
      const rawResult = response.data.editedText;
      
      // Clean markdown formatting for plain text replacement
      const cleanResult = cleanMarkdownForDisplay(rawResult);
      
      resultDiv.textContent = cleanResult;
      resultDiv.style.display = 'block';
      loadingDiv.style.display = 'none';
      applyBtn.disabled = false;
      applyBtn.style.opacity = '1';
      
      // Store result for apply
      applyBtn.onclick = () => {
        replaceSelectedText(cleanResult);
        popup.remove();
      };
    } else {
      loadingDiv.innerHTML = `<p style="color: #ff6b6b; margin: 0;">Error: ${response.error}</p>`;
    }
  } catch (error) {
    console.error('[NeuroSEDA] Error processing text:', error);
    loadingDiv.innerHTML = `<p style="color: #ff6b6b; margin: 0;">Error: ${error.message}</p>`;
    applyBtn.disabled = false;
    applyBtn.style.opacity = '1';
  }
}

// Escape HTML to prevent injection
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Clean markdown formatting for plain text display/replacement
function cleanMarkdownForDisplay(text) {
  try {
    let cleaned = text
      // Remove bold: **text** → text
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      // Remove italic: *text* → text
      .replace(/\*([^*]+)\*/g, '$1')
      // Remove code: `text` → text
      .replace(/`([^`]+)`/g, '$1')
      // Remove links: [text](url) → text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove headings: # Title → Title
      .replace(/^#+\s+(.+)$/gm, '$1')
      // Remove bullet points: * item → item
      .replace(/^\*\s+(.+)$/gm, '$1')
      // Remove numbered lists: 1. item → item
      .replace(/^\d+\.\s+(.+)$/gm, '$1')
      // Remove blockquotes: > text → text
      .replace(/^>\s+(.+)$/gm, '$1')
      // Clean up multiple spaces
      .replace(/  +/g, ' ')
      // Clean up multiple newlines
      .replace(/\n\n+/g, '\n')
      .trim();
    
    return cleaned;
  } catch (error) {
    console.error('[NeuroSEDA] Error cleaning markdown:', error);
    return text;
  }
}

// Note: The main message listener is defined earlier in the file within the 
// chrome.runtime.onMessage.addListener block. This handles INJECT_TEXT, 
// REPLACE_TEXT, APPEND_TEXT, and SHOW_TEXT_POPUP messages.
// The listener has been consolidated to avoid duplicate definitions.

// Clear selection
function clearSelection() {
  if (selectedElement) {
    selectedElement.classList.remove('neuro-element-highlight');
    selectedElement = null;
  }
  if (originalElement) {
    originalElement.classList.remove('neuro-element-highlight');
    originalElement = null;
  }
}

// Get element attributes
function getElementAttributes(element) {
  const attrs = {};
  for (let attr of element.attributes) {
    if (attr.name !== 'class' && attr.name !== 'id' && attr.name !== 'style') {
      attrs[attr.name] = attr.value;
    }
  }
  return attrs;
}

// Get page description
function getPageDescription() {
  const meta = document.querySelector('meta[name="description"]');
  return meta ? meta.getAttribute('content') : '';
}

// Get main page content for summarization
function getPageContent() {
  try {
    // Try to find main content areas
    const mainSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.content',
      '.main-content',
      '#content',
      '#main',
      '.article',
      '.post',
      '.entry-content'
    ];
    
    let mainContent = null;
    for (const selector of mainSelectors) {
      mainContent = document.querySelector(selector);
      if (mainContent) break;
    }
    
    // If no main content found, use body but exclude common non-content elements
    if (!mainContent) {
      mainContent = document.body;
    }
    
    // Clone to avoid modifying original
    const clone = mainContent.cloneNode(true);
    
    // Remove script, style, and other non-content elements
    const elementsToRemove = clone.querySelectorAll('script, style, nav, header, footer, aside, .sidebar, .menu, .navigation, .ad, .advertisement, .cookie, .popup, .modal, .overlay, [role="banner"], [role="navigation"], [role="complementary"]');
    elementsToRemove.forEach(el => el.remove());
    
    // Extract text content
    let text = clone.innerText || clone.textContent || '';
    
    // Clean up the text
    text = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
      .trim();
    
    // Limit to reasonable length (first 10000 characters for summarization)
    const maxLength = 10000;
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }
    
    return {
      title: document.title,
      url: window.location.href,
      content: text,
      length: text.length,
      metaDescription: getPageDescription()
    };
  } catch (error) {
    console.error('[NeuroSEDA] Error extracting page content:', error);
    return {
      title: document.title,
      url: window.location.href,
      content: document.body.innerText?.substring(0, 10000) || '',
      length: 0,
      metaDescription: getPageDescription()
    };
  }
}

// Get interactive elements from page for prediction analysis
function getPageElements() {
  try {
    const elements = [];
    
    // Selectors for interactive elements
    const interactiveSelectors = [
      'button',
      'input[type="text"]',
      'input[type="email"]',
      'input[type="password"]',
      'input[type="search"]',
      'input[type="submit"]',
      'input[type="button"]',
      'textarea',
      'select',
      'a[href]',
      '[contenteditable="true"]',
      '[onclick]',
      '[role="button"]',
      '[tabindex]',
      'form',
      '[data-action]',
      '.btn',
      '.button'
    ];
    
    const foundElements = document.querySelectorAll(interactiveSelectors.join(','));
    
    foundElements.forEach((element, index) => {
      // Skip hidden or very small elements
      const rect = element.getBoundingClientRect();
      if (rect.width < 5 || rect.height < 5 || 
          getComputedStyle(element).visibility === 'hidden' ||
          getComputedStyle(element).display === 'none') {
        return;
      }
      
      // Extract element data
      const elementData = {
        tag: element.tagName.toLowerCase(),
        type: element.type || '',
        text: getElementText(element),
        id: element.id || '',
        classes: element.className || '',
        attributes: {
          role: element.getAttribute('role') || '',
          'aria-label': element.getAttribute('aria-label') || '',
          placeholder: element.getAttribute('placeholder') || '',
          value: element.value || '',
          href: element.getAttribute('href') || '',
          onclick: element.hasAttribute('onclick'),
          disabled: element.disabled || false
        },
        position: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        },
        bbox: getBoundingBox(element),
        idx: index,
        visible: rect.width > 0 && rect.height > 0,
        interactionType: determineInteractionType(element)
      };
      
      elements.push(elementData);
    });
    
    console.log(`[NeuroSEDA] Found ${elements.length} interactive elements for prediction`);
    return elements.slice(0, 50); // Limit to top 50 elements
    
  } catch (error) {
    console.error('[NeuroSEDA] Error getting page elements:', error);
    return [];
  }
}

// Determine the type of interaction for an element
function determineInteractionType(element) {
  const tag = element.tagName.toLowerCase();
  const type = element.type || '';
  
  if (tag === 'button' || type === 'button' || type === 'submit') {
    return 'click';
  }
  if (tag === 'input' && ['text', 'email', 'password', 'search'].includes(type)) {
    return 'input';
  }
  if (tag === 'textarea' || element.contentEditable === 'true') {
    return 'input';
  }
  if (tag === 'select') {
    return 'select';
  }
  if (tag === 'a') {
    return 'click';
  }
  if (element.hasAttribute('onclick') || element.getAttribute('role') === 'button') {
    return 'click';
  }
  if (type === 'checkbox' || type === 'radio') {
    return 'toggle';
  }
  
  return 'click'; // Default
}

// Add debounced text selection listener
let textSelectionTimeout;

function debouncedTextSelection() {
  clearTimeout(textSelectionTimeout);
  textSelectionTimeout = setTimeout(() => {
    handleTextSelection();
  }, 200); // Wait 200ms after last mouse event
}

document.addEventListener('mouseup', debouncedTextSelection);
document.addEventListener('touchend', debouncedTextSelection);

// Image selection functionality
let isImageSelectionMode = false;
let hoveredImage = null;

// Listen for image right-click context menu
document.addEventListener('contextmenu', (e) => {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
    showImageMenu(e.target, e);
  }
});

// Show context menu for images
function showImageMenu(img, event) {
  const existingMenu = document.getElementById('neuro-image-menu');
  if (existingMenu) existingMenu.remove();
  
  const menu = document.createElement('div');
  menu.id = 'neuro-image-menu';
  menu.style.cssText = `
    position: fixed;
    top: ${event.clientY}px;
    left: ${event.clientX}px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    font-family: Arial, sans-serif;
    font-size: 13px;
    font-weight: 500;
    min-width: 180px;
  `;
  
  const option1 = document.createElement('div');
  option1.textContent = '🖼️ Send to NeuroSEDA';
  option1.style.cssText = `
    padding: 8px 16px;
    cursor: pointer;
    transition: background 0.2s;
  `;
  option1.addEventListener('mouseenter', () => option1.style.background = 'rgba(255,255,255,0.2)');
  option1.addEventListener('mouseleave', () => option1.style.background = 'transparent');
  option1.addEventListener('click', () => {
    sendImageToSidebar(img);
    menu.remove();
  });
  
  const option2 = document.createElement('div');
  option2.textContent = '🔍 Analyze Image';
  option2.style.cssText = `
    padding: 8px 16px;
    cursor: pointer;
    transition: background 0.2s;
    border-top: 1px solid rgba(255,255,255,0.2);
  `;
  option2.addEventListener('mouseenter', () => option2.style.background = 'rgba(255,255,255,0.2)');
  option2.addEventListener('mouseleave', () => option2.style.background = 'transparent');
  option2.addEventListener('click', () => {
    sendImageToSidebar(img);
    menu.remove();
  });
  
  menu.appendChild(option1);
  menu.appendChild(option2);
  document.body.appendChild(menu);
  
  // Remove menu on click outside
  setTimeout(() => {
    const clickHandler = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', clickHandler);
      }
    };
    document.addEventListener('click', clickHandler);
  }, 100);
}

// Send image to sidebar
async function sendImageToSidebar(img) {
  try {
    console.log('[NeuroSEDA] Capturing image...');
    
    // Convert image to base64
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create new image object to ensure CORS isn't blocking
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    
    tempImg.onload = () => {
      canvas.width = tempImg.width;
      canvas.height = tempImg.height;
      ctx.drawImage(tempImg, 0, 0);
      
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
      
      const elementData = {
        tag: 'IMG',
        text: img.alt || img.title || 'Image',
        html: imageBase64,
        src: img.src,
        classes: img.className,
        id: img.id,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        attributes: getElementAttributes(img),
        source: 'image_selection'
      };
      
      console.log('[NeuroSEDA] Image captured, sending to sidebar');
      
      // Send to background script
      chrome.runtime.sendMessage({
        type: 'ELEMENT_SELECTED',
        element: elementData
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[NeuroSEDA] Image send error:', chrome.runtime.lastError);
        } else {
          console.log('[NeuroSEDA] Image sent successfully');
        }
      });
      
      // Open sidebar
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: 'OPEN_SIDEPANEL'
        }).catch(() => {});
      }, 100);
    };
    
    tempImg.onerror = () => {
      console.error('[NeuroSEDA] Failed to load image');
      // Try with original src as fallback
      elementData = {
        tag: 'IMG',
        text: img.alt || img.title || 'Image',
        src: img.src,
        classes: img.className,
        id: img.id,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        attributes: getElementAttributes(img),
        source: 'image_selection',
        imageUrl: img.src
      };
      
      chrome.runtime.sendMessage({
        type: 'ELEMENT_SELECTED',
        element: elementData
      });
    };
    
    tempImg.src = img.src;
    
  } catch (error) {
    console.error('[NeuroSEDA] Error capturing image:', error);
  }
}

// Initialize - notify that content script is loaded
console.log('[NeuroSEDA] Content script loaded successfully');
