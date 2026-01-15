# 🚀 How to Install NeuroSEDA Chrome Extension

## Quick Installation Steps

### Step 1: Open Chrome Extensions Page
1. Open **Google Chrome** browser
2. Type in the address bar: `chrome://extensions/`
3. Press **Enter**

### Step 2: Enable Developer Mode
1. Look for **"Developer mode"** toggle in the **top-right corner**
2. **Turn it ON** (toggle should be blue/enabled)

### Step 3: Load the Extension
1. Click the **"Load unpacked"** button (appears after enabling Developer mode)
2. Navigate to the extension folder:
   ```
   /home/avanti-vinay-sangai/.cursor/worktrees/AI-automation-/jon/ai-sidebar-extension
   ```
3. **Select the `ai-sidebar-extension` folder** (not individual files)
4. Click **"Select Folder"** or **"Open"**

### Step 4: Verify Installation
✅ You should see:
- Extension appears in the list as **"NeuroSEDA - AI Web Assistant"**
- Extension icon (🧠) appears in Chrome toolbar
- No error messages in red

## 🎯 Quick Test

1. **Click the extension icon** in Chrome toolbar
2. **Sidebar should open** on the right side
3. Navigate to any website (e.g., `https://example.com`)
4. **Select some text** on the page
5. A purple button **"🧠 Add to NeuroSEDA"** should appear
6. Click it to test the extension!

## 📁 Required Files

Make sure these files exist in `ai-sidebar-extension/` folder:
- ✅ `manifest-v3.json` (or `manifest.json`)
- ✅ `background-v2.js` (or `background.js`)
- ✅ `content.js`
- ✅ `sidepanel.html`
- ✅ `sidepanel.js`
- ✅ `sidepanel-styles.css`
- ✅ `content-styles.css`

## ⚠️ Common Issues & Solutions

### Issue 1: "Manifest file is missing or unreadable"
**Solution:**
- Make sure you selected the **folder**, not individual files
- Check that `manifest-v3.json` exists in the folder
- Verify the manifest file has no syntax errors

### Issue 2: Extension icon not appearing
**Solution:**
- Refresh the extensions page (`chrome://extensions/`)
- Check if extension is enabled (toggle should be ON)
- Try pinning the extension to toolbar (click the puzzle icon in Chrome toolbar)

### Issue 3: "Service worker registration failed"
**Solution:**
- Check that `background-v2.js` or `background.js` exists
- Verify the file name matches what's in `manifest.json`
- Reload the extension (click the reload icon on extension card)

### Issue 4: Sidebar not opening
**Solution:**
- Click the extension icon in toolbar
- Check browser console (F12) for errors
- Make sure you're on a regular website (not `chrome://` pages)

### Issue 5: Content script not working
**Solution:**
- Refresh the webpage (F5)
- Reload the extension from `chrome://extensions/`
- Check DevTools Console (F12) for error messages

## 🔄 After Making Code Changes

If you modify any extension files:
1. Go to `chrome://extensions/`
2. Find "NeuroSEDA - AI Web Assistant"
3. Click the **reload icon** (🔄) on the extension card
4. Refresh any open webpages

## 📸 Visual Guide

```
Chrome Browser
├── Address Bar: chrome://extensions/
├── Top Right: [Developer mode] ← Toggle ON
├── Click: [Load unpacked]
└── Select Folder: ai-sidebar-extension/
    └── ✅ Extension installed!
```

## ✅ Installation Checklist

- [ ] Chrome browser opened
- [ ] Navigated to `chrome://extensions/`
- [ ] Developer mode enabled
- [ ] Selected `ai-sidebar-extension` folder
- [ ] Extension appears in list
- [ ] Extension icon visible in toolbar
- [ ] Sidebar opens when clicking icon
- [ ] No error messages shown

## 🎉 Success!

Once installed, you can:
- Click extension icon to open sidebar
- Select text on any webpage
- Use element inspector
- Chat with AI about page content
- Use AI tools (rephrase, summarize, etc.)

## 🆘 Still Having Issues?

1. **Check Console Errors:**
   - Press F12 to open DevTools
   - Go to Console tab
   - Look for red error messages

2. **Verify File Structure:**
   ```bash
   ls -la ai-sidebar-extension/
   ```
   Should show all required files

3. **Check Permissions:**
   - Extension should request permissions on first use
   - Grant all requested permissions

4. **Try Incognito Mode:**
   - Some extensions work differently in incognito
   - Test in regular browsing mode first

---

**Need help? Check the troubleshooting section in the setup guides!**
