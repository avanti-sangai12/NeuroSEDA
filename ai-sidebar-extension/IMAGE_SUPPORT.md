# NeuroSEDA Image Support Guide

## 🖼️ Image Analysis Features

NeuroSEDA now supports analyzing images from any website! Right-click on any image to interact with it.

## 🚀 How to Use Image Support

### Step 1: Open a Website
Navigate to any website with images (e.g., Wikipedia, news sites, image galleries)

### Step 2: Right-Click on an Image
- Find any image on the webpage
- **Right-click** on the image
- A purple context menu appears with two options:
  - **🖼️ Send to NeuroSEDA** - Send image to sidebar
  - **🔍 Analyze Image** - Analyze the image with AI

### Step 3: Interact with the Image
The image appears in the sidebar with:
- **Preview** - See the actual image
- **Dimensions** - Image size in pixels
- **Description** - Alt text or image description
- **Source URL** - Where the image came from

### Step 4: Ask Questions
In the chat box, ask questions about the image:
- "What's in this image?"
- "Describe what you see"
- "Extract any text from this image"
- "Analyze the main objects"
- "What is the purpose of this image?"

## 📸 What You Can Do

### Image Analysis
```
Right-click image → "🔍 Analyze Image" → Ask "Describe this image"
```

### Text Extraction
```
Right-click image → "🖼️ Send to NeuroSEDA" → Ask "Extract all text from this image"
```

### Image Understanding
```
Right-click image → Send to sidebar → Ask any visual question
```

### Detailed Questions
- "What objects are in this image?"
- "What colors dominate this image?"
- "Is there any text? What does it say?"
- "Describe the scene"
- "What is the subject of this photo?"

## 🔧 Technical Details

### How Images Are Processed

1. **Capture** - Image is captured from the DOM using Canvas API
2. **Convert** - Converted to base64 JPEG format (80% quality)
3. **Send** - Sent to Gemini API with your question
4. **Analyze** - AI analyzes and responds with insights

### Image Data Flow

```
Webpage Image
    ↓
Right-click menu
    ↓
Canvas capture (base64)
    ↓
Sidebar preview
    ↓
Gemini API with image
    ↓
AI response in chat
```

### Supported Image Types
- ✅ JPEG/JPG
- ✅ PNG
- ✅ GIF
- ✅ WebP
- ✅ SVG
- ✅ BMP

### Image Size Limits
- Maximum preview: 200px height (scaled to fit)
- Full resolution sent to Gemini API
- CORS-compliant images supported

## 🔒 Privacy & Security

### Image Data
- ✅ Images captured locally in your browser
- ✅ Processed locally before sending
- ✅ Only sent to Gemini API when you send a message
- ✅ Not stored or cached

### What's Sent to Gemini
- Image data (base64 encoded)
- Your question/prompt
- Page context (URL, title)
- Element details

### What's NOT Sent
- ❌ Any data you don't select
- ❌ Private browsing history
- ❌ Cookies or tracking data
- ❌ Form data or credentials

## 💡 Example Use Cases

### 1. Product Research
```
Right-click product image → Send to sidebar
Ask: "Extract the product name and price visible in this image"
Result: Product details extracted
```

### 2. Document Scanning
```
Right-click document screenshot → Send to sidebar
Ask: "Extract all the text from this document"
Result: OCR text extraction
```

### 3. Image Identification
```
Right-click animal/plant image → Send to sidebar
Ask: "What species is this? Describe its characteristics"
Result: Detailed species information
```

### 4. Screenshot Analysis
```
Right-click UI screenshot → Send to sidebar
Ask: "What app is this? Describe the interface"
Result: App analysis and interface details
```

### 5. Chart/Graph Analysis
```
Right-click chart image → Send to sidebar
Ask: "What does this chart show? What are the trends?"
Result: Data interpretation
```

## ⚠️ Limitations

### Cannot Process
- ❌ Images loaded dynamically after page load (sometimes)
- ❌ Images behind authentication
- ❌ Images with CORS restrictions
- ❌ Extremely large images (>10MB)

### Workaround
If an image won't load:
1. Reload the webpage (F5)
2. Try a different image
3. Check if image URL is accessible
4. Use a screenshot tool if needed

## 🎯 Best Results Tips

### For Best Image Analysis:
1. ✅ Use **high-quality, clear images**
2. ✅ Right-click **directly on the image** element
3. ✅ **Zoom in** on complex images if needed
4. ✅ Ask **specific questions** about what you want to know
5. ✅ Provide **context** in your question if needed

### Good Prompts
- "Describe what you see in this image"
- "Extract the main text from this screenshot"
- "What are the objects in this image?"
- "Analyze the colors and composition"

### Poor Prompts
- "Analyze this" (too vague)
- "What is it?" (be more specific)
- "Tell me everything" (too broad)

## 🔍 Troubleshooting

### Right-click Menu Doesn't Appear
**Problem:** Context menu not showing on images
- Reload the page (F5)
- Try a different image
- Check console for errors (F12)

**Fix:**
1. Reload extension from `chrome://extensions/`
2. Refresh the webpage
3. Try right-clicking again

### Image Not Loading in Sidebar
**Problem:** Image shows as broken in preview
- CORS restriction (cross-origin image)
- Image URL invalid
- Image deleted from server

**Fix:**
1. Use a different image
2. Make sure image is on accessible website
3. Try a screenshot of the image instead

### Gemini Doesn't Recognize Image
**Problem:** AI says it can't see the image
- Image too small or unclear
- Format not supported
- API issue

**Fix:**
1. Ask again with clearer question
2. Try a clearer image
3. Check internet connection
4. Verify API key working

### Images Taking Too Long
**Problem:** Image processing is slow
- Large image file
- Slow internet
- API latency

**Wait:** Usually completes in 2-5 seconds
If longer: Check internet connection

## 📚 Advanced

### Batch Image Analysis
1. Right-click first image → Send to sidebar
2. Ask questions about it
3. Clear selection (X button)
4. Right-click next image
5. Continue asking questions

### Compare Images
1. Send first image
2. Ask: "Remember this image"
3. Clear selection
4. Send second image
5. Ask: "Compare this with the previous image"

### Image with Text
1. Right-click image with visible text
2. Ask: "Extract all text from this image"
3. AI uses OCR to read text

## 🆘 Need Help?

If images aren't working:
1. Check DevTools Console (F12) for errors
2. Look for `[NeuroSEDA]` logs
3. Try reloading extension from chrome://extensions/
4. Refresh the webpage (F5)
5. Try a different website

## ✨ Features Coming Soon

- [ ] Multiple image support
- [ ] Image comparison
- [ ] Image editing tools
- [ ] Screenshot annotation
- [ ] Image search integration
- [ ] Vision API advanced features

---

**Enjoy AI-powered image analysis on any website!** 🖼️ 🧠
