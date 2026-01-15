# Image Analysis - Debugging Guide

## 🖼️ How Image Selection Works

```
Right-click image on webpage
        ↓
Context menu appears
        ↓
Click "Send to NeuroSEDA"
        ↓
Image converted to base64 (Canvas API)
        ↓
Sent to background.js
        ↓
Extracted and added to Gemini payload
        ↓
Gemini API analyzes image
        ↓
Response in sidebar
```

## ❌ If Images Not Working

### Step 1: Open DevTools

1. **On the webpage** (NOT sidebar):
   - Press **F12**
   - Go to **Console** tab

2. **Right-click an image**
   - Should see: `[NeuroSEDA] Capturing image...`

3. **Look for logs:**
   ```
   [NeuroSEDA] Capturing image...
   [NeuroSEDA] Image captured, sending to sidebar
   ```

### Step 2: Check for Errors

**Look for RED errors like:**
```
CORS error
Failed to load image
Cross-origin error
```

**If you see CORS error:**
- Image is on a different domain
- Server doesn't allow cross-origin access
- Try a different image
- Or try a screenshot tool instead

### Step 3: Check in Sidebar

1. **Open sidebar DevTools** (F12 in sidebar)
2. **Go to Console**
3. **You should see:**
   ```
   [NeuroSEDA Sidebar] Element selected: {tag: "IMG", ...}
   ```

### Step 4: Check Background Script

1. **Go to `chrome://extensions/`**
2. **Find NeuroSEDA**
3. **Click "Inspect views" → "background.html"**
4. **Go to Console tab**
5. **Look for:**
   ```
   [NeuroSEDA] Checking for image data in element content
   [NeuroSEDA] Found image data in element content
   [NeuroSEDA] Image base64 extracted, length: 12345
   [NeuroSEDA] Adding image to API payload
   [NeuroSEDA] Calling Gemini API...
   ```

## 🔍 Console Log Checklist for Images

**Content Script (F12 on webpage):**
- [ ] `[NeuroSEDA] Capturing image...`
- [ ] `[NeuroSEDA] Image captured, sending to sidebar`
- [ ] `[NeuroSEDA] Image sent successfully`

**Sidebar (F12 on sidebar):**
- [ ] `[NeuroSEDA Sidebar] Element selected: {tag: "IMG"...}`
- [ ] `[NeuroSEDA] Processing selected element`

**Background (chrome://extensions → background.html):**
- [ ] `[NeuroSEDA] Checking for image data in element content`
- [ ] `[NeuroSEDA] Found image data in element content`
- [ ] `[NeuroSEDA] Image base64 extracted, length: XXXXX`
- [ ] `[NeuroSEDA] Adding image to API payload`
- [ ] `[NeuroSEDA] Image payload added, total parts: 2`

## ⚠️ Common Image Issues

### Issue 1: CORS Error
**Error:**
```
CORS policy: Cross-origin...
Failed to load image due to CORS
```

**Cause:** Image server doesn't allow cross-origin requests

**Fix:**
- Try different image on same site
- Use a screenshot tool
- Try Wikipedia images (usually allow CORS)

### Issue 2: Image Not Appearing in Sidebar
**Symptoms:**
- Image uploaded but doesn't show preview
- Message says "Element selected" but no image

**Debug:**
1. Check sidebar DevTools for errors
2. Image might not have had alt text/description
3. Try different image with more metadata

### Issue 3: "Base64 extracted, length: 0"
**Cause:** Canvas couldn't capture image

**Fix:**
1. Make sure image fully loaded on page
2. Wait a moment before right-clicking
3. Try a different image format (PNG, GIF, etc.)

### Issue 4: Image Sent But AI Doesn't Respond to It
**Cause:** Gemini API might not recognize image format

**Solutions:**
- API key might have image analysis disabled
- Try asking simpler question about image
- Try text-only questions first to verify chat works
- Then retry with image

## 🧪 Test Procedure

### Test 1: Simple Image
1. Go to **Wikipedia** (images usually work)
2. Right-click an image
3. Click "Send to NeuroSEDA"
4. Check sidebar - image should preview
5. Ask: "What is this?"
6. AI should respond about the image

### Test 2: Check Logs
1. **Open webpage DevTools (F12)**
2. Right-click image
3. Look at Console - should see capture logs
4. **Open background DevTools (chrome://extensions)**
5. Scroll down, see extraction logs

### Test 3: Different Formats
- Try PNG image
- Try GIF image
- Try JPEG image
- See which work best

## 📊 Image Requirements

**Image Format:**
- ✅ JPEG (best)
- ✅ PNG
- ✅ GIF
- ✅ WebP

**Image Size:**
- ⚠️ Very small images (<50x50) might not work well
- ✅ Medium images (300x300+) work best
- ⚠️ Very large images (>10MB) might fail

**Image Loading:**
- ✅ Fully loaded images only
- ❌ Images still loading
- ❌ Lazy-loaded images sometimes fail

## 🔧 If Still Not Working

1. **Reload extension:**
   - chrome://extensions/ → Refresh

2. **Check API Key:**
   - Right-click extension → Options
   - Verify Gemini API key is set
   - Click Save again

3. **Clear cache:**
   - Options → Clear All Data
   - Set API key again

4. **Restart Chrome:**
   - Close all Chrome windows
   - Reopen Chrome
   - Try again

5. **Try text mode first:**
   - Make sure chat works with text
   - Then try images

## 📋 What Logs Should Show

**Everything working:**
```
[NeuroSEDA] Capturing image...
[NeuroSEDA] Image captured, sending to sidebar
[NeuroSEDA] Image sent successfully
[NeuroSEDA Sidebar] Element selected: {tag: "IMG", text: "...", source: "image_selection"}
[NeuroSEDA] Checking for image data in element content
[NeuroSEDA] Found image data in element content
[NeuroSEDA] Image base64 extracted, length: 18000
[NeuroSEDA] Adding image to API payload
[NeuroSEDA] Image payload added, total parts: 2
[NeuroSEDA] Calling Gemini API...
[NeuroSEDA] Gemini API response received
```

---

**If you see all these logs, image support is working!** 🎉
