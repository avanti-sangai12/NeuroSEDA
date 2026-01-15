// NeuroSEDA AI Sidebar - Background Service Worker (Fixed)
const GEMINI_API_KEY = 'AIzaSyBZH9zAza5GUIB0hLKtfLrm_jxi-bzSiw4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

console.log('[NeuroSEDA] Background service worker initialized');

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  console.log('[NeuroSEDA] Extension icon clicked, opening side panel');
  chrome.sidePanel.open({ tabId: tab.id });
});

// Handle messages from content script and sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[NeuroSEDA] Received message:', request.type);
  
  if (request.type === 'OPEN_SIDEPANEL') {
    chrome.sidePanel.open({ tabId: sender.tab.id });
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
    chrome.runtime.sendMessage({
      type: 'ELEMENT_DATA',
      element: request.element,
      tabId: sender.tab.id
    }).catch((err) => {
      console.log('[NeuroSEDA] Sidebar not available for element data:', err);
    });
    sendResponse({ success: true });
  }
  else if (request.type === 'SUMMARIZE_PAGE') {
    handlePageSummarization(request.pageContent)
      .then(response => {
        console.log('[NeuroSEDA] Summary generated successfully');
        sendResponse({ success: true, data: response });
      })
      .catch(error => {
        console.error('[NeuroSEDA] Summarization error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }
  else {
    console.warn('[NeuroSEDA] Unknown message type:', request.type);
    sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Call Gemini API
async function handleGeminiRequest(userPrompt, elementContent, pageContext) {
  const fullPrompt = `
You are an intelligent web assistant helping users interact with web pages.

Current Page Context:
- URL: ${pageContext?.url || 'Unknown'}
- Title: ${pageContext?.title || 'Unknown'}

${elementContent ? `Selected Element Content:\n${elementContent}` : 'No element selected'}

User Question/Request:
${userPrompt}

Please provide a helpful, concise response. If the user is asking about the selected element, focus on that. If they're asking about the page, consider the broader context.
  `;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: fullPrompt
          }
        ]
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

// Summarize webpage content
async function handlePageSummarization(pageContent) {
  const summaryPrompt = `
You are an AI assistant that creates concise, informative summaries of web pages.

Page Information:
- Title: ${pageContent.title || 'Untitled'}
- URL: ${pageContent.url || 'Unknown'}

Page Content:
${pageContent.content.substring(0, 8000)}

Please provide a comprehensive summary of this webpage that includes:
1. Main topic and purpose
2. Key points and important information
3. Main sections or topics covered
4. Any notable details or insights

Format the summary in a clear, readable way with proper paragraphs and bullet points where appropriate. Keep it concise but informative (aim for 200-400 words).
  `;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: summaryPrompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3, // Lower temperature for more focused summaries
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024
    }
  };

  try {
    console.log('[NeuroSEDA] Calling Gemini API for page summarization...');
    
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
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary generated';
    
    console.log('[NeuroSEDA] Page summary generated successfully');
    
    return {
      summary: summary,
      timestamp: new Date().toISOString(),
      pageTitle: pageContent.title,
      pageUrl: pageContent.url
    };
  } catch (error) {
    console.error('[NeuroSEDA] Summarization API error:', error);
    throw error;
  }
}

console.log('[NeuroSEDA] Background service worker ready');
