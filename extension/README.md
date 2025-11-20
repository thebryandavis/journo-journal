# Journo Journal Browser Extension

Quick capture extension for Journo Journal - save web content directly to your workspace.

## Features

- **Quick Capture**: Save articles, quotes, and research with one click
- **Context Menu**: Right-click on any selection to save
- **Keyboard Shortcut**: Press `Ctrl/Cmd + Shift + J` to capture
- **Smart Pre-fill**: Automatically captures page title and selected text
- **Type Selection**: Choose between Note, Idea, or Research
- **Tagging**: Add tags for instant organization

## Installation

### Development Mode

1. Open Chrome/Edge and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `extension` directory from the Journo Journal project
5. The extension icon should appear in your toolbar

### Production

The extension will be published to the Chrome Web Store and Edge Add-ons after launch.

## Usage

### Method 1: Extension Popup
1. Click the Journo Journal icon in your browser toolbar
2. Fill in the title, content, and tags
3. Click "Save to Journo Journal"

### Method 2: Context Menu
1. Select text on any webpage
2. Right-click and choose "Save to Journo Journal"
3. The popup will open with the selected text pre-filled

### Method 3: Keyboard Shortcut
1. Select text on any webpage
2. Press `Ctrl/Cmd + Shift + J`
3. The quick capture popup will appear

## Configuration

Update the `API_URL` in `popup.js` to point to your production API:

```javascript
const API_URL = 'https://journojournal.com'; // Production URL
```

## Building for Production

To prepare the extension for distribution:

1. Update `manifest.json` with production URLs
2. Create extension icons in `/icons` directory (16x16, 48x48, 128x128)
3. Zip the extension directory
4. Upload to Chrome Web Store

## Support

For issues or questions, visit: https://journojournal.com/support
