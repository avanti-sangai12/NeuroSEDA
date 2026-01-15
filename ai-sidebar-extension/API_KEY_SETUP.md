# NeuroSEDA - API Key Configuration Guide

## 🔐 Secure API Key Management

Your Gemini API key is now stored **securely in the browser's encrypted storage** instead of hardcoded in code files.

## ✅ Why This is Better

- ✅ **Never exposed in code** - API key not in Git repository
- ✅ **Encrypted storage** - Stored securely in Chrome's storage
- ✅ **Easy to update** - Change API key anytime via options page
- ✅ **Per-user configuration** - Each user has their own key
- ✅ **No hardcoding** - No secrets in source files

## 🚀 Setup Instructions

### Step 1: Get Your Gemini API Key

1. Go to https://aistudio.google.com
2. Click "Get API Key"
3. Create a new API key
4. Copy the key to clipboard

### Step 2: Open Extension Options

**Method 1: Direct Link**
1. Open `chrome://extensions/`
2. Find "NeuroSEDA - AI Web Assistant"
3. Click "Options" button

**Method 2: Right-Click Extension**
1. Right-click NeuroSEDA icon in toolbar
2. Click "Options"

### Step 3: Add Your API Key

1. Paste your Gemini API key in the "Gemini API Key" field
2. Password field masks the key for security
3. Click the 👁️ button to show/hide the key

### Step 4: Configure Settings (Optional)

- **AI Model**: Choose Gemini 2.0 Flash (default, fastest)
- **Max Response Length**: Set response token limit (1024 default)
- **Features**: Enable/disable features you want
- **Theme**: Auto, Light, or Dark mode

### Step 5: Save

1. Click **"💾 Save Settings"** button
2. See "✅ Settings saved successfully!" message
3. Done! Your API key is now encrypted and stored

## 🔒 Where API Keys Are Stored

### React App (.env.local)
- **Location**: User's local machine
- **Storage**: File system
- **Access**: Only during build/runtime
- **Security**: File-level permissions

### Chrome Extension
- **Location**: Browser's storage (chrome.storage.sync)
- **Storage**: Chrome profile encrypted database
- **Access**: Only by the extension
- **Security**: Chrome's built-in encryption

## ✨ How the Extension Loads API Key

1. Extension loads → background.js starts
2. Calls `chrome.storage.sync.get()` to retrieve key
3. Key loaded into memory
4. When message comes from sidebar → uses stored key
5. API call made with key to Gemini API

## 🔄 File Structure (No API Keys!)

```
ai-sidebar-extension/
├── manifest.json           ← Extension config (NO secrets)
├── background.js           ← Loads key from storage
├── content.js              ← Captures data
├── sidepanel.html/js/css   ← UI (NO secrets)
├── options.html            ← API key input form
├── options.js              ← Save/load settings
├── .env.example            ← Template (NO real key)
└── .gitignore              ← Ignores env files
```

## 📝 What Gets Committed to GitHub

```
✅ options.html         → Form for entering key
✅ options.js           → Save/load logic
✅ manifest.json        → Config
✅ .gitignore           → Ignore rules
✅ .env.example         → Template
❌ .env.local          → IGNORED (your real key stays local)
```

## 🆘 First Time Setup After Cloning

When someone clones your repository:

```bash
# 1. Clone repo
git clone <url>

# 2. Load extension in Chrome
# - Go to chrome://extensions/
# - Click "Load unpacked"
# - Select ai-sidebar-extension folder

# 3. Open extension options
# - Right-click NeuroSEDA icon
# - Click "Options"

# 4. Add their own API key
# - Go to https://aistudio.google.com
# - Get their API key
# - Paste in options page
# - Click Save

# 5. Start using!
```

## 🔧 Advanced: Multiple Keys

If you want to use different API keys for different purposes:

1. Add new setting in options.html
2. Store in `chrome.storage.sync`
3. Load in background.js
4. Use appropriate key for the task

## 🚨 Security Best Practices

### ✅ DO:
- Store API keys in `.env.local`
- Use `.gitignore` to prevent commits
- Update `.env.example` with template
- Use Chrome's storage API
- Validate API keys before use
- Handle errors gracefully

### ❌ DON'T:
- Hardcode API keys in JavaScript
- Commit `.env` files to Git
- Share your API key publicly
- Store keys in plain text
- Use API keys in console logs
- Send keys to external services

## 📊 API Key Flow

```
User enters key in options.html
        ↓
options.js validates format
        ↓
Saved to chrome.storage.sync (encrypted)
        ↓
background.js loads on startup
        ↓
Stored in GEMINI_API_KEY variable
        ↓
Used for Gemini API calls
        ↓
Response returned to sidebar
```

## 🔄 Updating API Key

**To change API key:**

1. Open Extension Options
2. Clear old key
3. Paste new key
4. Click "Save Settings"
5. Extension reloads with new key

**To reset settings:**

1. Open Extension Options
2. Click "Reset to Defaults"
3. Confirm in dialog
4. All settings reset (except chat history)

**To clear everything:**

1. Open Extension Options
2. Click "Clear All Data"
3. Confirm in dialog
4. All data deleted
5. You'll need to set API key again

## 💾 Storage Details

### Chrome Storage Types

- **chrome.storage.sync**: Syncs across devices
- **chrome.storage.local**: Stays on current device
- **Uses**: Encrypted, secure, Chrome-native

### Data Stored

```javascript
{
  GEMINI_API_KEY: "sk-...",          // Your API key
  apiModel: "gemini-2.0-flash",      // Model choice
  maxResponseLength: 1024,            // Token limit
  enableTextSelection: true,          // Feature flags
  enableImageAnalysis: true,
  enableElementInspector: true,
  enableNotifications: true,
  theme: "auto",
  enableChatHistory: true
}
```

## 🧪 Testing API Key

After saving, the extension automatically:

1. Loads key from storage
2. Checks if key exists
3. Uses it for API calls
4. Shows error if key missing

**To verify:**

1. Open DevTools (F12) on sidebar
2. Look for: `[NeuroSEDA] API key loaded from storage`
3. Send a message in chat
4. Should work if key is valid

## 🚀 Production Deployment

For production:

1. **Don't commit code with API keys** ✅
2. **Use environment variables** ✅
3. **Validate API key on startup** ✅
4. **Handle missing key gracefully** ✅
5. **Log errors (not keys)** ✅

## 📚 Related Files

- `manifest.json` - Added options_page entry
- `background.js` - Loads key from storage
- `sidepanel.js` - Uses key for API calls
- `.env.example` - Template (no real secrets)
- `.gitignore` - Prevents accidental commits

---

**Your Gemini API key is now secure and properly managed!** 🔒
