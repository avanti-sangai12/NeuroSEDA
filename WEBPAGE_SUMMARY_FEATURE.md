# 📄 Webpage Summarization Feature

## Overview

A new **Summary** tab has been added to the NeuroSEDA Chrome extension sidebar that allows users to generate AI-powered summaries of any webpage directly in the sidebar.

## Features

✅ **One-Click Summarization**: Generate summaries with a single button click  
✅ **Smart Content Extraction**: Automatically extracts main content from webpages  
✅ **AI-Powered**: Uses Google Gemini AI for intelligent summarization  
✅ **Page Information Display**: Shows page title, URL, and content length  
✅ **Refresh Capability**: Regenerate summaries for updated content  
✅ **Error Handling**: Graceful error messages for edge cases  

## How to Use

1. **Open the Extension Sidebar**
   - Click the NeuroSEDA extension icon in Chrome toolbar
   - Sidebar opens on the right side

2. **Navigate to Summary Tab**
   - Click the **📄 Summary** tab in the sidebar

3. **Generate Summary**
   - Click the **"✨ Generate Summary"** button
   - Wait for the AI to analyze the page content
   - Summary appears in the display area

4. **View Summary**
   - Read the comprehensive summary
   - Page information (title, URL, content length) is shown below

5. **Refresh (Optional)**
   - Click **"🔄 Refresh Summary"** to regenerate if page content changed

## Technical Implementation

### Files Modified

1. **`content.js`**
   - Added `getPageContent()` function to extract main content from webpages
   - Removes non-content elements (scripts, styles, navigation, ads)
   - Handles `GET_PAGE_CONTENT` message type

2. **`sidepanel.html`**
   - Added new "Summary" tab in navigation
   - Added summary panel with controls and display area
   - Includes loading, error, and info states

3. **`sidepanel.js`**
   - Added `generateWebpageSummary()` function
   - Added `loadPageInfo()` function to show page details
   - Integrated with tab switching to auto-load page info

4. **`background-v2.js`**
   - Added `handlePageSummarization()` function
   - Handles `SUMMARIZE_PAGE` message type
   - Calls Gemini API with optimized prompt for summarization

### Content Extraction Logic

The system intelligently extracts content by:

1. **Finding Main Content Areas**
   - Looks for semantic HTML5 elements: `<main>`, `<article>`, `[role="main"]`
   - Falls back to common content class names: `.content`, `.main-content`, `#content`
   - Uses `<body>` as last resort

2. **Cleaning Content**
   - Removes: scripts, styles, navigation, headers, footers, sidebars, ads
   - Extracts clean text content
   - Limits to first 10,000 characters for API efficiency

3. **Error Handling**
   - Handles Chrome special pages (chrome://, about:)
   - Validates minimum content length (50 characters)
   - Provides user-friendly error messages

### AI Summarization

The summarization uses:
- **Model**: Gemini 2.0 Flash
- **Temperature**: 0.3 (lower for focused summaries)
- **Max Tokens**: 1024
- **Prompt**: Optimized for comprehensive, structured summaries

Summary includes:
- Main topic and purpose
- Key points and important information
- Main sections or topics covered
- Notable details or insights

## User Interface

### Summary Tab Layout

```
┌─────────────────────────────┐
│ 📄 Webpage Summary          │
│                             │
│ [✨ Generate Summary]       │
│ [🔄 Refresh Summary]        │
│                             │
│ ┌─────────────────────────┐ │
│ │ Summary Content         │ │
│ │ (scrollable)            │ │
│ └─────────────────────────┘ │
│                             │
│ Page: [Title]              │
│ URL: [URL]                  │
│ Content Length: [chars]     │
│                             │
│ ℹ️ How it works:           │
│ • Extracts main content     │
│ • Uses AI for summarization │
│ • Highlights key points     │
└─────────────────────────────┘
```

## Error Handling

The feature handles various error scenarios:

1. **Chrome Special Pages**
   - Error: "Cannot summarize Chrome special pages"
   - Solution: Open a regular webpage

2. **Content Too Short**
   - Error: "Page content is too short to summarize"
   - Solution: Try a page with more text content

3. **Content Script Not Available**
   - Error: "Could not extract page content"
   - Solution: Refresh the page and try again

4. **API Errors**
   - Error: Shows specific API error message
   - Solution: Check internet connection and API key

## Limitations

- **Content Length**: Limited to first 10,000 characters for API efficiency
- **Special Pages**: Cannot summarize Chrome internal pages
- **Dynamic Content**: May not capture content loaded via JavaScript after page load
- **API Quota**: Subject to Gemini API rate limits

## Future Enhancements

Potential improvements:
- [ ] Auto-generate summary when tab opens
- [ ] Save summaries to history
- [ ] Export summaries as text/PDF
- [ ] Multiple summary styles (brief, detailed, bullet points)
- [ ] Summary of selected text only
- [ ] Multi-language support
- [ ] Summary caching for faster re-access

## Testing

To test the feature:

1. Install/Reload the extension
2. Open any article/blog/documentation page
3. Click extension icon → Summary tab
4. Click "Generate Summary"
5. Verify summary appears correctly
6. Test with different page types:
   - News articles
   - Blog posts
   - Documentation
   - Wikipedia pages
   - Product pages

## Troubleshooting

**Summary not generating?**
- Check browser console (F12) for errors
- Verify Gemini API key is valid
- Ensure page has sufficient text content
- Try refreshing the page

**Summary is incomplete?**
- Page content may be truncated at 10,000 characters
- Some dynamic content may not be captured
- Try scrolling to load more content first

**Page info not showing?**
- Content script may not be loaded
- Refresh the webpage
- Check if page allows content scripts

---

**Feature Status**: ✅ Complete and Ready to Use

**Last Updated**: 2024
