# NeuroSEDA - Text Selection Debugging Guide

## 🔍 How to Debug Text Selection Issues

### Step 1: Open DevTools
1. Open the website where you want to test
2. Press **F12** to open Chrome DevTools
3. Go to **Console** tab
4. You should see NeuroSEDA logs

### Step 2: Look for These Logs

#### ✅ When Working Correctly:
```
[NeuroSEDA] Content script loaded successfully
[NeuroSEDA] Selection detected. Length: 42 Text: This is the text I selected...
[NeuroSEDA] Valid text selected, showing menu
[NeuroSEDA] Menu position: { top: 250, left: 100 }
[NeuroSEDA] Menu appended to DOM
[NeuroSEDA] Menu clicked, sending text
[NeuroSEDA] Starting sendSelectedText with text length: 42
[NeuroSEDA] Element data prepared: {...}
[NeuroSEDA] Text sent to background successfully
```

#### ❌ When Not Working:
```
[NeuroSEDA] Text too short or empty
[NeuroSEDA] No selection range found
[NeuroSEDA] No range available for menu positioning
[NeuroSEDA] Error showing menu: ...
```

### Step 3: Common Issues & Fixes

#### **Issue 1: Button doesn't appear after selecting text**

**Check these logs:**
- `[NeuroSEDA] Selection detected. Length: 0` → Text wasn't actually selected
- `[NeuroSEDA] Text too short` → Selected text was less than 3 characters
- `[NeuroSEDA] No selection range found` → Selection API issue

**Solutions:**
1. Select **more text** (at least 3+ characters)
2. Make sure you're selecting **actual text** (not whitespace)
3. Try selecting in a different area of the page
4. Reload the page (F5) and try again

#### **Issue 2: Button appears but doesn't respond**

**Check these logs:**
- Look for `[NeuroSEDA] Menu clicked`
- If not present, click wasn't registered

**Solutions:**
1. Make sure you're **clicking the button** (not near it)
2. Try clicking again - button may be slightly offset
3. Reload page and try different text

#### **Issue 3: Button appears but sidebar doesn't open**

**Check these logs:**
- `[NeuroSEDA] Text sent to background successfully` ✓
- `[NeuroSEDA] Sidebar open request sent` ✓
- But sidebar doesn't show

**Solutions:**
1. Extension may be disabled
2. Check `chrome://extensions/` - NeuroSEDA should be enabled
3. Reload extension (refresh button on extension card)
4. Restart Chrome

#### **Issue 4: Text selection is inconsistent**

**Common cause:** Some websites override selection behavior

**Solutions:**
1. Try on a different website first
2. Different websites have different selection APIs
3. Some pages block selection for copyright reasons
4. Try selecting in plain text areas (articles, news)

### Step 4: Detailed Debugging

#### Check if Content Script Loaded:
1. Open DevTools Console
2. Type: `typeof chrome !== 'undefined' ? 'Chrome API available' : 'NOT available'`
3. Should return: `"Chrome API available"`

#### Check Content Script Status:
1. Look at DevTools Console on any webpage
2. Should see: `[NeuroSEDA] Content script loaded successfully`
3. If not, reload the page

#### Monitor Selection Events:
1. Paste this in Console:
```javascript
document.addEventListener('mouseup', () => {
  const sel = window.getSelection().toString();
  console.log('[DEBUG] Selection:', sel.substring(0, 50));
});
```
2. Now select text and watch console

### Step 5: Check Extension Status

#### Verify Extension in Chrome:
1. Go to `chrome://extensions/`
2. Find "NeuroSEDA - AI Web Assistant"
3. Should show:
   - ✅ Status: Enabled (toggle is ON)
   - ✅ No errors listed
   - ✅ Permissions granted

#### Reset Extension if Needed:
1. Go to `chrome://extensions/`
2. Click the **Refresh** icon on NeuroSEDA card
3. Try text selection again

### Step 6: Enable Full Logging

To see more details, modify content.js temporarily:

Add this at the top of file after requires:
```javascript
console.log('[NeuroSEDA] Full logging enabled');
console.log('[NeuroSEDA] Window object:', typeof window);
console.log('[NeuroSEDA] Chrome API:', typeof chrome);
console.log('[NeuroSEDA] Document:', typeof document);
```

### Step 7: Network Issues

#### Check Background Service Worker:
1. Go to `chrome://extensions/`
2. Click on NeuroSEDA
3. Look for "Errors" section
4. Should be empty

#### Check for Message Errors:
1. DevTools Console might show:
   - `Could not establish connection...` → Content script not loaded
   - `Receiving end does not exist` → Extension crashed
   - `No receiving end` → Service worker died

**Fix:** Reload extension from `chrome://extensions/`

## 📊 Real-Time Monitoring

### Create a Monitoring Script:
In DevTools Console, paste this:
```javascript
// Monitor NeuroSEDA activity
const originalLog = console.log;
const originalError = console.error;

console.log = function(...args) {
  if (args[0]?.includes?.('[NeuroSEDA]')) {
    console.style = 'color: purple; font-weight: bold;';
  }
  originalLog.apply(console, args);
};

console.error = function(...args) {
  if (args[0]?.includes?.('[NeuroSEDA]')) {
    console.style = 'color: red; font-weight: bold;';
  }
  originalError.apply(console, args);
};
```

## 🎯 Testing Checklist

- [ ] Content script loaded (check console log)
- [ ] Text selection triggers `[NeuroSEDA] Selection detected`
- [ ] Button appears below selected text
- [ ] Button text shows "🧠 Add to NeuroSEDA"
- [ ] Clicking button sends messages to background
- [ ] Sidebar opens with selected text

## 🔧 Advanced Debugging

### Check Element Data Being Sent:
1. Open DevTools Console
2. Paste:
```javascript
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type === 'ELEMENT_SELECTED') {
    console.log('[DEBUG] Element data received:', msg.element);
  }
});
```

### Monitor All Messages:
1. In DevTools Console:
```javascript
const origSendMessage = chrome.runtime.sendMessage;
chrome.runtime.sendMessage = function(...args) {
  console.log('[DEBUG] Sending message:', args[0]);
  return origSendMessage.apply(chrome.runtime, args);
};
```

## 📝 Common Solutions Quick List

| Problem | Solution |
|---------|----------|
| Button never appears | Select longer text (3+ chars) |
| Button appears rarely | Reload page (F5) |
| Button doesn't work | Extension disabled - enable it |
| Sidebar doesn't open | Reload extension from chrome://extensions |
| Inconsistent behavior | Try different website |
| No logs in console | Extension not installed or disabled |

## 🆘 If Still Not Working

1. **Check DevTools Console** for any [NeuroSEDA] errors
2. **Take a screenshot** of the console
3. **Verify extension enabled** in chrome://extensions
4. **Reload everything:**
   - Reload page (F5)
   - Reload extension (refresh icon)
   - Restart Chrome
5. **Try a simple website** like Wikipedia to test

---

**Pro Tip:** Keep DevTools Console open while testing to see all logs in real-time!
