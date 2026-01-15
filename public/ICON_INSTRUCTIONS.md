# 🎨 Chrome Extension Icon Instructions

## Required Icon Files

The Chrome extension needs these icon files to work properly:

- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels  
- `icon128.png` - 128x128 pixels

## How to Create Icons

### Option 1: Use an Online Icon Generator
1. Go to [Favicon.io](https://favicon.io/) or [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Upload a square image (at least 128x128 pixels)
3. Download the generated icons
4. Rename them to match the required filenames

### Option 2: Use a Simple Icon
1. Create a simple 128x128 pixel image with a brain icon or "NS" text
2. Use any image editor (Paint, GIMP, Photoshop, etc.)
3. Save as PNG format
4. Resize to create the 48x48 and 16x16 versions

### Option 3: Download Free Icons
1. Visit [Flaticon](https://www.flaticon.com/) or [Icons8](https://icons8.com/)
2. Search for "brain" or "neural network" icons
3. Download in PNG format
4. Resize to the required dimensions

## Icon Requirements

- **Format**: PNG (Portable Network Graphics)
- **Dimensions**: Exact pixel sizes as specified
- **Background**: Transparent or solid color
- **Style**: Simple, recognizable at small sizes

## Quick Fix

If you want to test the extension immediately without icons:

1. Open `public/manifest.json`
2. Remove or comment out the "icons" section
3. The extension will work without icons (though it won't look as professional)

## After Creating Icons

1. Place the icon files in the `public/` folder
2. Reload the extension in Chrome (`chrome://extensions/`)
3. The extension should now load without errors

---

**Note**: The placeholder files in this folder are just text files and won't work as icons. You need actual PNG image files.
