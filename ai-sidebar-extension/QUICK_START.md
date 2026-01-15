# NeuroSEDA AI Sidebar - Quick Start Guide

## ⚡ Installation (30 seconds)

1. Open `chrome://extensions/`
2. Enable **Developer mode** (toggle, top right)
3. Click **Load unpacked**
4. Select `D:\Neuro Final\ai-sidebar-extension`
5. Done! ✅

## 🚀 Basic Usage

### Text Selection Method (Recommended)
1. **Open any website**
2. **Select any text** on the page (drag to highlight)
3. **Purple button appears**: "🧠 Add to NeuroSEDA"
4. **Click the button**
5. **Sidebar opens** with your text ready
6. **Ask a question** in the chat box
7. **Get AI response** from Gemini

### Element Inspector Method
1. Click extension icon → Sidebar opens
2. Go to **Element** tab
3. Click **🎯 Start Selecting**
4. **Hover over elements** (they highlight with dashed border)
5. **Click an element** to select it
6. View **HTML, attributes, classes** in inspector
7. Go to **Chat** tab to ask questions

## 💬 Chat Features
- Ask questions about selected text or elements
- Chat history automatically saved
- Use **Ctrl+Enter** to send messages quickly
- Clear history anytime in Settings tab

## ✅ How to Know It's Working

**Extension Icon:**
- Purple gradient icon in Chrome toolbar
- Click to open/close sidebar

**Text Selection:**
- Select text → Button appears below it
- Button has 🧠 emoji and says "Add to NeuroSEDA"

**Sidebar:**
- Purple header with "NeuroSEDA AI"
- 3 tabs: Chat, Element, Settings
- Chat shows recent messages
- Loading spinner when thinking

**Gemini API:**
- Questions get AI responses
- Responses appear in chat as bot messages
- Check console (F12) for any errors

## ⚠️ Troubleshooting

### Purple button doesn't appear when selecting text
**Fix:**
- Refresh the webpage (F5)
- Reload extension from `chrome://extensions/`
- Try selecting larger text blocks

### Sidebar doesn't open
**Fix:**
- Make sure extension is enabled in `chrome://extensions/`
- Click the extension icon in toolbar
- Try on a different website

### AI responses not working
**Fix:**
- Check internet connection
- Verify Gemini API key in background.js
- Open DevTools (F12) → Console for errors
- Check quota limits on Gemini API

### Element selection not working
**Fix:**
- Make sure you're on a regular website (not Chrome special pages)
- Reload the webpage (F5)
- Try the text selection method instead

## 📊 What You Can Do

### Example: Summarize an Article
1. Select a paragraph from an article
2. Purple button appears
3. Click it → Opens sidebar with text
4. Ask: "Summarize this article"
5. Get instant AI summary

### Example: Analyze Code
1. Find code on a webpage
2. Select it
3. Ask: "Explain what this code does"
4. Get detailed explanation

### Example: Translate Text
1. Select foreign language text
2. Ask: "Translate this to English"
3. Get translation

### Example: Extract Information
1. Select product info/prices
2. Ask: "Extract just the price and format as currency"
3. Get formatted response

## 🔒 Privacy Notes

✅ **What's local:**
- Chat history stored in browser
- Element data processed locally
- No tracking cookies

✅ **What's sent to Gemini:**
- Your questions
- Selected text/element content
- Page context only

❌ **What's NOT collected:**
- Passwords or form data
- Personal identifiable information
- Any data you don't select

## 🎨 Customization

### Settings Tab
- Auto-open sidebar on icon click
- Enable/disable notifications
- Toggle sound alerts
- Choose light/dark theme
- Adjust response length

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| Not working at all | Reload extension + refresh webpage |
| Sidebar not opening | Click extension icon in toolbar |
| AI not responding | Check internet, verify API key |
| Text selection broken | Try reloading the page |
| Button hidden | Make sure text is selected first |

## ✨ Tips & Tricks

1. **Keyboard Shortcut:** Ctrl+Enter sends messages faster
2. **Multiple Selections:** Clear and select different elements
3. **Copy HTML:** Use Element tab to copy element HTML
4. **Chat History:** Auto-saved, view by scrolling up
5. **Dark Mode:** Change in Settings tab

## 🎯 Next Steps

1. ✅ Extension installed
2. 🌐 Open a website
3. 📝 Select some text
4. 💬 Click button and chat with AI
5. 🎉 Explore other features

---

**Enjoy your AI-powered web assistant! 🚀**

For issues, check the browser console (F12) for error messages.
