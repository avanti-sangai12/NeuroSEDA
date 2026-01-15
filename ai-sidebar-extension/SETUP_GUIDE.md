# NeuroSEDA AI Sidebar Extension - Setup Guide

## 📋 Installation Steps

### 1. **Open Chrome Extensions Page**
- Go to `chrome://extensions/` in your Chrome browser
- Enable **Developer mode** (toggle in the top-right corner)

### 2. **Load the Extension**
- Click **Load unpacked**
- Navigate to `D:\Neuro Final\ai-sidebar-extension` folder
- Select the folder and click **Select Folder**

### 3. **Verify Installation**
- The extension should appear in your extensions list as "NeuroSEDA - AI Web Assistant"
- You should see the extension icon in your Chrome toolbar

## 🚀 How to Use

### Basic Workflow

1. **Open any website** in Chrome
2. **Click the NeuroSEDA extension icon** (🧠) in the toolbar
3. A **sidebar will open** on the right side of the page
4. **Select an element** by clicking the "🎯 Select Element" button
5. **Hover and click** on any element on the webpage
6. The element will be **highlighted and captured**
7. **Ask a question** about the element in the chat box
8. **Get AI-powered insights** from Gemini

### Features

#### 💬 Chat Tab
- Send messages about the page or selected element
- Gemini AI provides intelligent responses
- View chat history (last 5 conversations)
- Persistent chat history saved to browser storage

#### 🎯 Element Inspector Tab
- Select elements with visual highlighting
- View complete element details:
  - Tag name
  - Element ID and classes
  - Full content preview
  - HTML source code
  - All attributes
- Copy HTML to clipboard with one click
- Detailed element information display

#### ⚙️ Settings Tab
- Auto-open sidebar on extension click
- Enable/disable notifications
- Enable/disable sound alerts
- Choose response theme (Light/Dark/Auto)
- Adjust maximum response length
- Clear chat history
- View about information

## 🎨 UI Components

### Header
- Shows "NeuroSEDA AI" branding
- Purple gradient background
- Identifies the application

### Tab Navigation
- **💬 Chat**: Main conversation interface
- **🎯 Element**: Element inspection and analysis tool
- **⚙️ Settings**: Configuration and preferences

### Chat Interface
- Message display area with auto-scroll
- User messages (purple gradient background)
- Bot responses (light background with border)
- Text formatting support (bold, italic, code)
- Input area with textarea
- Select Element button
- Send button (Ctrl+Enter support)
- Loading spinner during AI processing

### Element Selection
- Visual highlighting with dashed border
- Purple pulse animation indicator
- Element information display
- Clear selection button

## 🔧 How It Works

### Flow Diagram
```
User selects element on webpage
        ↓
Content script captures element data
        ↓
Element displayed in sidebar
        ↓
User asks question about element
        ↓
Sidebar sends to background script
        ↓
Gemini API called with element context
        ↓
AI response displayed in chat
        ↓
Conversation saved to browser storage
```

### Technical Details

**Manifest.json**
- Declares extension metadata
- Defines permissions (activeTab, scripting, storage, sidePanel)
- Specifies content scripts and side panel HTML
- Background service worker configuration

**Content.js**
- Runs on all websites
- Handles element selection and highlighting
- Captures element information (HTML, text, attributes)
- Communicates with sidebar via message passing
- Provides visual feedback during selection

**Background.js**
- Service worker for extension
- Handles Gemini API calls
- Manages message routing
- Constructs AI prompts with context

**Sidepanel.html/js/css**
- Sidebar UI interface
- Chat message display
- Element inspector
- Settings management
- Message handling and formatting

## 📝 Example Use Cases

### 1. Analyze Article Content
```
✓ Select: Blog article paragraph
? Ask: "Summarize the main points of this article"
```

### 2. Inspect Form Fields
```
✓ Select: Input field or form element
? Ask: "What should I enter in this field?"
```

### 3. Extract Data
```
✓ Select: Product information, price, or description
? Ask: "Extract just the price and format as currency"
```

### 4. Code Analysis
```
✓ Select: Code snippet on webpage
? Ask: "Explain what this code does"
```

### 5. Content Translation
```
✓ Select: Text in foreign language
? Ask: "Translate this to English"
```

## ⚠️ Troubleshooting

### Extension Not Loading
**Problem:** "Manifest file is missing or unreadable"
- Ensure all files are in the correct folder
- Check manifest.json for syntax errors
- Verify file paths in manifest.json

### Content Script Not Running
**Problem:** Element selection not working
- Reload the extension (`chrome://extensions/`)
- Refresh the webpage (F5)
- Check browser console for errors (F12)

### Gemini API Not Responding
**Problem:** "Error communicating with AI"
- Verify API key in background.js
- Check internet connection
- Ensure API has quota remaining
- Check Gemini API status

### Sidebar Not Opening
**Problem:** Sidebar doesn't appear when clicking extension icon
- Check if extension is properly installed
- Verify permissions are granted
- Try reloading the extension
- Restart Chrome if needed

### Element Selection Not Highlighting
**Problem:** Elements not visually highlighted when hovering
- Check browser console for CSS errors
- Verify content-styles.css is loaded
- Try reloading the webpage
- Check if website has conflicting CSS

## 🔒 Privacy & Security

- **Local Processing**: All data processing happens in your browser
- **No Data Upload**: Selected elements are only used locally
- **Gemini API Only**: Communication is only with Gemini API
- **No External Tracking**: Extension doesn't track user behavior
- **Storage**: Chat history stored in browser local storage only
- **No Passwords**: Extension never captures sensitive credentials

## 🎓 Tips & Tricks

1. **Quick Selection**: Use the Select Element button to quickly toggle selection mode
2. **Keyboard Shortcut**: Use Ctrl+Enter to send messages faster
3. **Copy HTML**: The Inspector tab lets you copy element HTML directly
4. **Chat History**: Your conversations are automatically saved
5. **Element Details**: Check the Element tab for detailed HTML and attribute information

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Look at browser console (F12) for error messages
3. Verify all files are present in the extension folder
4. Ensure manifest.json syntax is correct
5. Try reloading the extension from chrome://extensions/

## 🚀 Next Steps

After installation, try:
1. Navigate to a website (e.g., Wikipedia, news site, documentation)
2. Click the extension icon
3. Select an article or section
4. Ask the AI a question about it
5. Explore the Element Inspector to see detailed information
6. Use Settings to customize your experience

## 📊 Version

**NeuroSEDA AI Assistant v1.0**
- Powered by Gemini AI
- Chrome Extension
- Real-time element selection and analysis
- Intelligent conversational interface

---

**Ready to get started? Load the extension and start exploring!** 🚀
