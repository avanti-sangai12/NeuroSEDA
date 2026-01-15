# NeuroSEDA Sidebar - Debugging Guide

## 🔍 Check for Errors (DO THIS FIRST!)

### Step 1: Open Sidebar DevTools
1. Open NeuroSEDA sidebar in Chrome
2. Press **F12** (or right-click → Inspect)
3. Go to **Console** tab
4. Look for ANY red error messages

### Step 2: Look for These Log Messages

When everything works, you should see:

```
[NeuroSEDA] Content script loaded successfully
[NeuroSEDA Sidebar] Received message: ELEMENT_SELECTED
[NeuroSEDA] Element selected: {...}
```

## ❌ Common Issues

### Issue 1: "Select Element" Button Not Working

**Symptoms:**
- Button doesn't change color when clicked
- Nothing happens
- No messages in sidebar

**Debug Steps:**
1. Open sidebar
2. Open DevTools (F12)
3. Click "Select Element" button
4. Look at Console - you should see:
   ```
   [NeuroSEDA] Toggle element selection clicked
   [NeuroSEDA] Active tab: (tab ID) (URL)
   [NeuroSEDA] Selection mode: ON
   ```

**If NOT showing these logs:**
- Reload the extension (chrome://extensions/ → Refresh)
- Reload the webpage
- Try again

**If showing error:**
```
chrome.runtime.lastError: Could not establish connection...
```
This means content script not loaded. See Issue 2.

### Issue 2: Content Script Not Loaded

**Symptoms:**
- "Element selection not working on this page"
- Error: "Message send error"
- Works on some sites, not others

**Fix:**
1. You're probably on a Chrome special page (chrome://, about://, etc.)
2. Open a regular website: Wikipedia, Google, news site
3. Reload webpage (F5)
4. Try element selection again

**These DON'T work:**
- chrome://extensions/
- chrome://settings/
- about:blank
- about:config

**These DO work:**
- Google.com
- Wikipedia.org
- GitHub.com
- Any regular website

### Issue 3: "Select Text" Button Not Working

**Symptoms:**
- Select text on page
- Purple button doesn't appear
- Or button appears but doesn't respond

**Debug Steps:**
1. Open DevTools on the webpage (F12, on the actual website)
2. Select some text
3. Look at Console - you should see:
   ```
   [NeuroSEDA] Selection detected. Length: 42 Text: ...
   [NeuroSEDA] Valid text selected, showing menu
   [NeuroSEDA] Menu appended to DOM
   ```

**If NOT showing:**
- Text too short (need 3+ characters)
- Try selecting more text
- Reload page

**If showing "Text too short":**
- Select longer text

### Issue 4: Element Selected But Not Showing in Sidebar

**Symptoms:**
- "Element selected" message in chat
- But no content showing
- Empty element info

**Debug Steps:**
1. Open sidebar DevTools (F12)
2. Look for:
   ```
   [NeuroSEDA Sidebar] Element selected: {tag: "P", text: "..."}
   ```

**If NOT showing:**
- Element selection not working (see Issue 2)

**If showing but empty:**
- Element might not have text
- Try selecting a different element with content

### Issue 5: Chat Not Sending Messages

**Symptoms:**
- Type message and click Send
- Nothing happens
- Or error in chat

**Debug Steps:**
1. Open sidebar DevTools (F12)
2. Type a message
3. Click Send button
4. Look for logs:
   ```
   [NeuroSEDA] Sending message: Your message here
   [NeuroSEDA] Selected element: {...}
   [NeuroSEDA] Calling Gemini API...
   [NeuroSEDA] Gemini API response received
   ```

**If missing "Calling Gemini API...":**
- API key not set
- Go to extension Options
- Enter Gemini API key
- Click Save
- Try sending message again

**If shows "API key not configured":**
- API key not saved properly
- Open Options (right-click extension → Options)
- Verify API key is entered
- Click Save

**If Gemini API error:**
- Look for error message in console
- Could be API quota exceeded
- Could be network issue

## 🔧 Full Test Procedure

Follow this to test everything:

### Test 1: Load Extension
1. Go to chrome://extensions/
2. Find "NeuroSEDA"
3. Verify status is "Enabled"
4. If not enabled, click toggle to enable
5. Click "Reload" button

### Test 2: Open Sidebar
1. Open any website (not Chrome special page)
2. Click NeuroSEDA icon in toolbar
3. Sidebar should open on right side
4. You should see "Chat" tab with welcome message

### Test 3: Check DevTools
1. Open sidebar
2. Press F12
3. Console tab should show NO errors (no red text)
4. Should show log messages as you interact

### Test 4: Test Text Selection
1. On webpage, select some text (minimum 3 characters)
2. Purple button should appear: "🧠 Add to NeuroSEDA"
3. Click the button
4. Check sidebar - should switch to Chat tab
5. Should show "✅ Element selected!" message
6. Check DevTools Console for logs

### Test 5: Test Element Selection
1. Click "🎯 Select Element" button in sidebar
2. Should turn purple/active
3. Go to webpage, hover over elements
4. Elements should highlight with dashed border
5. Click an element
6. Check sidebar - should show element info
7. Check DevTools for success logs

### Test 6: Test Chat
1. Select any element or text
2. Type a message in chat box
3. Click send or press Ctrl+Enter
4. Watch for logs in DevTools
5. AI should respond with message
6. If not, check API key in Options

## 📋 Console Log Checklist

**For text selection:**
- [ ] `[NeuroSEDA] Selection detected. Length: XX`
- [ ] `[NeuroSEDA] Valid text selected, showing menu`
- [ ] `[NeuroSEDA] Menu appended to DOM`
- [ ] `[NeuroSEDA] Menu clicked, sending text`
- [ ] `[NeuroSEDA] Text sent to background successfully`

**For element selection:**
- [ ] `[NeuroSEDA] Toggle element selection clicked`
- [ ] `[NeuroSEDA] Active tab: (ID) (URL)`
- [ ] `[NeuroSEDA] Selection mode: ON`
- [ ] `[NeuroSEDA] Message sent successfully`

**For receiving element:**
- [ ] `[NeuroSEDA Sidebar] Received message: ELEMENT_SELECTED`
- [ ] `[NeuroSEDA Sidebar] Element selected: {...}`

**For sending chat message:**
- [ ] `[NeuroSEDA] Sending message: Your message`
- [ ] `[NeuroSEDA] Selected element: {...}`
- [ ] `[NeuroSEDA] Calling Gemini API...`
- [ ] `[NeuroSEDA] Gemini API response received`

## 🆘 If You Still Have Issues

1. **Take screenshot of:**
   - DevTools Console (F12 with all errors visible)
   - Sidebar (showing the issue)

2. **Note:**
   - What action you did
   - What you expected
   - What actually happened

3. **Check:**
   - API key is set in Options
   - Internet connection works
   - Using regular website (not Chrome special page)
   - Extension is enabled

4. **Try:**
   - Reload extension (chrome://extensions/ → Refresh)
   - Reload webpage (F5)
   - Close sidebar and reopen
   - Restart Chrome

5. **Last resort:**
   - Clear all data (Options → Clear All Data)
   - Remove and reload extension
   - Set API key again

## 📞 Getting Help

Share this info when reporting issues:
1. Browser version (Chrome menu → About Google Chrome)
2. Extension version (should see in chrome://extensions/)
3. Website URL (what site were you on?)
4. Console screenshot (F12 → Console → Take screenshot)
5. What you clicked and what happened

---

**All console logs start with `[NeuroSEDA]` - look for these!**
