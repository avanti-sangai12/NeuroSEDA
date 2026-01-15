// NeuroSEDA AI Sidebar - Background Service Worker (Fixed)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const PREDICTION_SERVICE_URL = 'http://localhost:5000';
let GEMINI_API_KEY = null;

console.log('[NeuroSEDA] Background service worker initialized');
console.log('[NeuroSEDA] Prediction service available at:', PREDICTION_SERVICE_URL);

// Load API key from Chrome storage on startup
chrome.storage.sync.get(['GEMINI_API_KEY'], (result) => {
  if (result.GEMINI_API_KEY) {
    GEMINI_API_KEY = result.GEMINI_API_KEY;
    console.log('[NeuroSEDA] API key loaded from storage');
  } else {
    console.warn('[NeuroSEDA] No API key found in storage. Please set it in extension options.');
  }
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  console.log('[NeuroSEDA] Extension icon clicked, opening side panel');
  chrome.sidePanel.open({ tabId: tab.id });
});

// Create context menu for selected text
chrome.runtime.onInstalled.addListener(() => {
  console.log('[NeuroSEDA] Creating context menus');
  
  // Parent menu
  chrome.contextMenus.create({
    id: 'neuroSEDA-parent',
    title: 'NeuroSEDA',
    contexts: ['selection']
  });
  
  // Rephrase option
  chrome.contextMenus.create({
    id: 'neuroSEDA-rephrase',
    parentId: 'neuroSEDA-parent',
    title: '✏️ Rephrase',
    contexts: ['selection']
  });
  
  // Fix Grammar option
  chrome.contextMenus.create({
    id: 'neuroSEDA-grammar',
    parentId: 'neuroSEDA-parent',
    title: '📝 Fix Grammar',
    contexts: ['selection']
  });
  
  // Summarize option
  chrome.contextMenus.create({
    id: 'neuroSEDA-summarize',
    parentId: 'neuroSEDA-parent',
    title: '📄 Summarize',
    contexts: ['selection']
  });
  
  // Explain option
  chrome.contextMenus.create({
    id: 'neuroSEDA-explain',
    parentId: 'neuroSEDA-parent',
    title: '💡 Explain',
    contexts: ['selection']
  });
  
  // Shorten option
  chrome.contextMenus.create({
    id: 'neuroSEDA-shorten',
    parentId: 'neuroSEDA-parent',
    title: '✂️ Shorten',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.selectionText) return;
  
  console.log('[NeuroSEDA] Context menu clicked:', info.menuItemId);
  
  const selectedText = info.selectionText;
  let action = null;
  
  switch(info.menuItemId) {
    case 'neuroSEDA-rephrase':
      action = 'rephrase';
      break;
    case 'neuroSEDA-grammar':
      action = 'fix-grammar';
      break;
    case 'neuroSEDA-summarize':
      action = 'summarize';
      break;
    case 'neuroSEDA-explain':
      action = 'explain';
      break;
    case 'neuroSEDA-shorten':
      action = 'shorten';
      break;
  }
  
  if (!action) return;
  
  // Send to content script to show popup
  chrome.tabs.sendMessage(tab.id, {
    type: 'SHOW_TEXT_POPUP',
    selectedText: selectedText,
    action: action
  }).catch(err => {
    console.log('[NeuroSEDA] Could not send to content script:', err);
  });
});

// Handle messages from content script and sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[NeuroSEDA] Received message:', request.type);
  
  if (request.type === 'OPEN_SIDEPANEL') {
    if (sender.tab && sender.tab.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id });
    } else {
      console.log('[NeuroSEDA] Opening sidepanel from non-tab context');
    }
    sendResponse({ success: true });
  } 
  else if (request.type === 'GEMINI_REQUEST') {
    handleGeminiRequest(request.prompt, request.elementContent, request.pageContext)
      .then(response => {
        console.log('[NeuroSEDA] Gemini response sent successfully');
        sendResponse({ success: true, data: response });
      })
      .catch(error => {
        console.error('[NeuroSEDA] Gemini error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }
  else if (request.type === 'ELEMENT_SELECTED') {
    console.log('[NeuroSEDA] Element selected:', request.element.tag);
    // Forward element selection to sidebar
    const tabId = sender.tab ? sender.tab.id : 'unknown';
    chrome.runtime.sendMessage({
      type: 'ELEMENT_SELECTED',
      element: request.element,
      tabId: tabId
    }).catch((err) => {
      console.log('[NeuroSEDA] Sidebar not available for element data:', err);
    });
    sendResponse({ success: true });
  }
  else if (request.type === 'PREDICT_NEXT_ELEMENT') {
    console.log('[NeuroSEDA] Predicting next element...');
    
    // Handle case where message comes from sidepanel (no tab context)
    const tabId = sender.tab ? sender.tab.id : (request.tabId || 'unknown');
    const pageUrl = sender.tab ? sender.tab.url : (request.pageUrl || 'unknown');
    
    console.log('[NeuroSEDA] Tab ID:', tabId, 'URL:', pageUrl);
    
    predictNextElement(
      tabId,
      request.currentElement,
      request.allElements,
      pageUrl,
      request.instruction
    )
      .then(predictions => {
        console.log('[NeuroSEDA] Next element predictions ready:', predictions.length);
        sendResponse({ success: true, data: predictions });
      })
      .catch(error => {
        console.error('[NeuroSEDA] Prediction error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  else if (request.type === 'RECORD_ACTION') {
    console.log('[NeuroSEDA] Recording action:', request.actionType);
    const tabId = sender.tab ? sender.tab.id : (request.tabId || 'unknown');
    recordAction(
      tabId,
      request.element,
      request.actionType
    )
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('[NeuroSEDA] Action recording error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  else if (request.type === 'GENERATE_CONTENT') {
    console.log('[NeuroSEDA] Generating content:', request.contentType);
    generateContent(request.prompt, request.contentType, request.context)
      .then(response => {
        console.log('[NeuroSEDA] Content generated successfully');
        sendResponse({ success: true, data: response });
      })
      .catch(error => {
        console.error('[NeuroSEDA] Content generation error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  else if (request.type === 'REPHRASE_TEXT') {
    console.log('[NeuroSEDA] Rephrasing text');
    rephraseText(request.text, request.action, request.context)
      .then(response => {
        console.log('[NeuroSEDA] Text rephrased successfully');
        try {
          sendResponse({ success: true, data: response });
        } catch (e) {
          console.error('[NeuroSEDA] Could not send response:', e);
        }
      })
      .catch(error => {
        console.error('[NeuroSEDA] Rephrasing error:', error);
        try {
          sendResponse({ success: false, error: error.message });
        } catch (e) {
          console.error('[NeuroSEDA] Could not send error response:', e);
        }
      });
    return true;
  }
  else {
    console.warn('[NeuroSEDA] Unknown message type:', request.type);
    sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// ============================================================================
// PREDICTION SERVICE FUNCTIONS
// ============================================================================

async function predictNextElement(tabId, currentElement, allElements, pageUrl, instruction) {
  // Predict next element to interact with
  try {
    console.log('[NeuroSEDA] Calling prediction service for tab:', tabId);
    
    const payload = {
      tab_id: tabId.toString(),
      current_element: currentElement,
      all_elements: allElements,
      page_url: pageUrl,
      instruction: instruction,
      top_k: 3
    };
    
    const response = await fetch(`${PREDICTION_SERVICE_URL}/predict/next-element`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[NeuroSEDA] Predictions received:', data.predictions.length);
    
    return data.predictions || [];
  } catch (error) {
    console.error('[NeuroSEDA] Prediction service error:', error);
    // Return empty predictions on error instead of throwing
    return [];
  }
}

async function recordAction(tabId, element, actionType) {
  // Record user action for learning
  try {
    console.log('[NeuroSEDA] Recording action for tab:', tabId);
    
    const payload = {
      tab_id: tabId.toString(),
      element: element,
      action_type: actionType
    };
    
    const response = await fetch(`${PREDICTION_SERVICE_URL}/predict/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    console.log('[NeuroSEDA] Action recorded successfully');
  } catch (error) {
    console.error('[NeuroSEDA] Action recording error:', error);
    // Don't throw - this is non-critical
  }
}

// ============================================================================
// GEMINI API FUNCTIONS
// ============================================================================

// Call Gemini API
async function handleGeminiRequest(userPrompt, elementContent, pageContext) {
  let fullPrompt = `
You are an intelligent web assistant helping users interact with web pages.

Current Page Context:
- URL: ${pageContext?.url || 'Unknown'}
- Title: ${pageContext?.title || 'Unknown'}

${elementContent ? `Selected Element Content:\n${elementContent}` : 'No element selected'}

User Question/Request:
${userPrompt}

Please provide a helpful, concise response. If the user is asking about the selected element, focus on that. If they're asking about the page, consider the broader context.
  `;
  
  // Check if element content contains image data
  let hasImage = false;
  let imageData = null;
  
  console.log('[NeuroSEDA] Checking for image data in element content');
  
  if (elementContent && elementContent.includes('data:image')) {
    console.log('[NeuroSEDA] Found image data in element content');
    hasImage = true;
    
    // Extract base64 image data - match the full data URI
    const match = elementContent.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
    if (match && match[1]) {
      imageData = match[1];
      console.log('[NeuroSEDA] Image base64 extracted, length:', imageData.length);
      fullPrompt += '\n\n[NOTE: An image has been provided by the user]';
    } else {
      console.warn('[NeuroSEDA] Image data found but could not extract base64');
      hasImage = false;
    }
  } else {
    console.log('[NeuroSEDA] No image data found in element content');
  }

  // Build payload with image support
  const parts = [
    {
      text: fullPrompt
    }
  ];
  
  // Add image data if available
  if (hasImage && imageData) {
    console.log('[NeuroSEDA] Adding image to API payload');
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageData
      }
    });
    console.log('[NeuroSEDA] Image payload added, total parts:', parts.length);
  } else if (hasImage && !imageData) {
    console.warn('[NeuroSEDA] Image flag set but no data available');
  }
  
  const payload = {
    contents: [
      {
        parts: parts
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024
    }
  };

  try {
    // Verify API key is available
    if (!GEMINI_API_KEY) {
      throw new Error('API key not configured. Please set your Gemini API key in extension options.');
    }
    
    console.log('[NeuroSEDA] Calling Gemini API...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}: Gemini API error`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
    
    console.log('[NeuroSEDA] Gemini API response received');
    
    return {
      response: aiResponse,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[NeuroSEDA] Gemini API error:', error);
    throw error;
  }
}

// ============================================================================
// CONTENT GENERATION & TEXT EDITING FUNCTIONS
// ============================================================================

// Generate content (emails, messages, posts, etc.)
async function generateContent(prompt, contentType, context = {}) {
  try {
    let enhancedPrompt = '';
    
    switch (contentType) {
      case 'email':
        enhancedPrompt = `Write a professional email about: ${prompt}

Context: ${context.pageUrl || ''}
Format: Professional email with subject, greeting, body, and closing.
Tone: ${context.tone || 'professional'}
Length: ${context.length || 'medium'} length`;
        break;
        
      case 'reply':
        enhancedPrompt = `Write a reply to this message/email: ${context.originalText || ''}

User wants to say: ${prompt}
Tone: ${context.tone || 'professional'}
Format: Direct reply without subject line`;
        break;
        
      case 'message':
        enhancedPrompt = `Write a message about: ${prompt}
Tone: ${context.tone || 'casual'}
Platform: ${context.platform || 'general'}
Length: ${context.length || 'short'}`;
        break;
        
      case 'form':
        enhancedPrompt = `Fill out this form field with appropriate content: ${prompt}
Field context: ${context.fieldLabel || ''}
Field type: ${context.fieldType || 'text'}`;
        break;
        
      default:
        enhancedPrompt = `Generate content about: ${prompt}
Type: ${contentType}
Context: ${JSON.stringify(context)}`;
    }
    
    const response = await callGeminiAPI(enhancedPrompt);
    return {
      content: response.response,
      contentType: contentType,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw error;
  }
}

// Rephrase/edit text
async function rephraseText(text, action, context = {}) {
  try {
    let prompt = '';
    
    switch (action) {
      case 'fix-grammar':
        prompt = `Fix the grammar and spelling in this text, keep the same meaning and tone:

"${text}"

Return only the corrected text.`;
        break;
        
      case 'rephrase':
        prompt = `Rephrase this text to be clearer and more ${context.tone || 'professional'}:

"${text}"

Keep the same meaning but improve the wording. Return only the rephrased text.`;
        break;
        
      case 'shorten':
        prompt = `Make this text shorter while keeping the main points:

"${text}"

Return only the shortened version.`;
        break;
        
      case 'expand':
        prompt = `Expand this text with more detail and explanation:

"${text}"

Add relevant details and make it more comprehensive.`;
        break;
        
      case 'tone-change':
        prompt = `Change the tone of this text to be more ${context.newTone || 'professional'}:

"${text}"

Keep the same meaning but adjust the tone. Return only the adjusted text.`;
        break;
        
      case 'explain':
        prompt = `Explain what this text means in simple terms:

"${text}"

Provide a clear explanation of the content.`;
        break;
        
      case 'summarize':
        prompt = `Summarize this text in a few key points:

"${text}"

Return the main points clearly.`;
        break;
        
      default:
        prompt = `Improve this text: "${text}"
Action: ${action}
Context: ${JSON.stringify(context)}`;
    }
    
    const response = await callGeminiAPI(prompt);
    return {
      originalText: text,
      editedText: response.response,
      action: action,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw error;
  }
}

// Helper function to call Gemini API (reuse existing logic)
async function callGeminiAPI(prompt) {
  return await handleGeminiRequest(prompt, '', {
    url: 'Generated content',
    title: 'AI Assistant'
  });
}

console.log('[NeuroSEDA] Background service worker ready');
