# 🚀 Chrome Extension Setup Guide for NeuroSEDA

This guide will help you set up the Chrome extension to enable real-time browsing data analysis and enhanced action predictions.

## 📋 Prerequisites

- Google Chrome browser (version 88+)
- NeuroSEDA app running locally
- Basic understanding of Chrome extensions

## 🔧 Installation Steps

### 1. **Download Extension Files**

Ensure you have the following files in your `public/` directory:
- `manifest.json` - Extension configuration (or use `manifest-minimal.json` for testing)
- `background.js` - Background service worker
- `content.js` - Content script for webpage monitoring
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality script

### 2. **Load Extension in Chrome**

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `public/` folder containing your extension files
5. The extension should now appear in your extensions list

### 3. **Grant Permissions**

When prompted, allow the extension to:
- ✅ **Read browsing history** - For behavioral analysis
- ✅ **Access tabs** - For current context
- ✅ **Store data** - For behavioral insights

## 🔐 Permission Details

The extension requests these permissions for optimal functionality:

| Permission | Purpose | Required |
|------------|---------|----------|
| `history` | Analyze browsing patterns and search queries | ✅ Yes |
| `tabs` | Get current tab context and real-time updates | ✅ Yes |
| `storage` | Store behavioral data and user preferences | ✅ Yes |
| `http://*/*` | Monitor all websites for behavioral data | ✅ Yes |
| `https://*/*` | Monitor secure websites for behavioral data | ✅ Yes |

## 🎯 How It Works

### **Background Service Worker** (`background.js`)
- Handles Chrome API calls
- Analyzes browsing patterns
- Provides behavioral insights
- Manages real-time data collection

### **Content Script** (`content.js`)
- Runs on every webpage
- Tracks user interactions:
  - Mouse movements
  - Keystrokes
  - Scroll events
  - Clicks and focus
  - Form submissions
  - Search queries
  - Page performance

### **Data Flow**
```
Webpage → Content Script → Background Script → NeuroSEDA App
```

## 🧪 Testing the Extension

### 1. **Check Extension Status**
- Look for the NeuroSEDA icon in your Chrome toolbar
- Click it to see the popup (if implemented)
- Check `chrome://extensions/` for any errors

### 2. **Verify Data Collection**
- Open Chrome DevTools (F12)
- Navigate to the Console tab
- Look for "NeuroSEDA content script initialized" messages
- Browse different websites to see data collection

### 3. **Test in NeuroSEDA App**
- Open your NeuroSEDA app
- Navigate to the "Chrome History Predictions" tab
- Check if the extension status shows "Connected"
- Verify real-time data is being received

## 🔍 Troubleshooting

### **Extension Not Loading**
```
Error: Manifest file is missing or unreadable
```
**Solution:** Ensure `manifest.json` is in the correct location and properly formatted.

### **Icon Loading Error**
```
Error: Could not load icon 'icon16.png' specified in 'icons'
```
**Solutions:**
1. **Quick Fix**: Use `manifest-minimal.json` instead of `manifest.json` (no icons required)
2. **Proper Fix**: Create actual PNG icon files (see `ICON_INSTRUCTIONS.md`)
3. **Alternative**: Remove the "icons" section from `manifest.json`

### **Permission Denied**
```
Error: chrome.history is undefined
```
**Solution:** Check that all permissions are granted in `chrome://extensions/`.

### **Content Script Not Running**
```
No console messages from NeuroSEDA
```
**Solution:** 
1. Reload the extension
2. Check for JavaScript errors in DevTools
3. Verify content script matches in manifest.json

### **Data Not Reaching App**
```
Extension status shows "Not Available"
```
**Solution:**
1. Ensure both extension and app are running
2. Check browser console for connection errors
3. Verify message passing between extension and app

## 📊 Data Privacy & Security

### **What Data is Collected**
- **Browsing History**: URLs, titles, visit times
- **User Interactions**: Mouse, keyboard, scroll activity
- **Page Context**: Current tab information
- **Search Queries**: What you're searching for

### **What Data is NOT Collected**
- ❌ Passwords or form data
- ❌ Private browsing sessions
- ❌ Incognito mode data
- ❌ File contents or downloads

### **Data Storage**
- All data is stored locally in Chrome
- No data is sent to external servers
- Data is processed in real-time for predictions
- Historical data can be cleared via Chrome settings

## 🚀 Advanced Configuration

### **Customizing Data Collection**

Edit `content.js` to modify what data is collected:

```javascript
// Adjust tracking sensitivity
const TRACKING_CONFIG = {
  mouseMoveThrottle: 1000,    // Mouse movement update frequency (ms)
  scrollThrottle: 500,        // Scroll event update frequency (ms)
  inactivityThreshold: 300000, // Inactivity detection (5 minutes)
  maxDataPoints: 1000         // Maximum data points per session
};
```

### **Domain Filtering**

Edit `background.js` to exclude specific domains:

```javascript
const EXCLUDED_DOMAINS = [
  'chrome://',
  'chrome-extension://',
  'about:',
  'file://'
];

function shouldTrackDomain(url) {
  return !EXCLUDED_DOMAINS.some(domain => url.startsWith(domain));
}
```

### **Performance Optimization**

For better performance, adjust update frequencies:

```javascript
// In content.js
const UPDATE_FREQUENCIES = {
  mouseMovement: 2000,    // Update every 2 seconds
  scrollEvents: 1000,      // Update every 1 second
  keystrokes: 500,         // Update every 0.5 seconds
  pageMetrics: 5000        // Update every 5 seconds
};
```

## 🔄 Integration with NeuroSEDA

### **Real-Time Updates**
The extension provides real-time behavioral data that enhances:
- Action prediction accuracy
- Context-aware suggestions
- Workflow recommendations
- Productivity insights

### **API Endpoints**
The extension responds to these message types:
- `getBehavioralData` - Current behavioral metrics
- `getHistoryInsights` - Browsing pattern analysis
- `getSearchPatterns` - Search behavior insights

### **Data Format**
```javascript
{
  success: true,
  data: {
    patterns: { productivity: 15, research: 23, social: 8 },
    currentContext: { domain: 'github.com', category: 'productivity' },
    totalVisits: 156,
    uniqueDomains: 45,
    timeDistribution: { morning: 25, afternoon: 40, evening: 30, night: 15 }
  }
}
```

## 🎉 Benefits of Chrome Integration

### **Enhanced Accuracy**
- Real browsing data instead of simulated metrics
- Actual search queries and visited domains
- Time-based pattern analysis
- Context-aware predictions

### **Rich Insights**
- Domain categorization (productivity, research, social)
- Search behavior analysis
- Focus pattern detection
- Productivity scoring

### **Real-Time Context**
- Current tab information
- Live behavioral updates
- Immediate pattern recognition
- Instant suggestion generation

## 🚨 Important Notes

1. **Extension Required**: The enhanced features only work when the Chrome extension is installed and active
2. **Fallback Mode**: If the extension is not available, the app gracefully falls back to mock data
3. **Privacy First**: All data processing happens locally in your browser
4. **Performance**: The extension is optimized for minimal performance impact
5. **Updates**: Reload the extension after making changes to the code

## 🆘 Support

If you encounter issues:

1. **Check Chrome Extensions Page**: `chrome://extensions/`
2. **Review Console Logs**: Open DevTools and check for errors
3. **Verify Permissions**: Ensure all required permissions are granted
4. **Test in Incognito**: Some extensions behave differently in private mode
5. **Clear Extension Data**: Reset the extension if needed

---

**🎯 With the Chrome extension properly configured, NeuroSEDA will provide significantly more accurate action predictions and personalized suggestions based on your actual browsing behavior!**
