# IlmTab Browser Extension Installation Guide

## What is IlmTab?

IlmTab is a browser extension that transforms your new tab page into an Islamic spiritual dashboard, featuring daily Quran verses, authentic Hadith, and productivity tools.

## Features

- **Daily Quran Verses**: Random ayahs with multiple translations and audio recitation
- **Authentic Hadith**: Daily hadith from major Islamic collections
- **Audio Player**: High-quality Quran recitation with multiple reciters
- **Search Function**: Find specific verses and surahs
- **Favorites**: Save and organize your favorite verses and hadith
- **Todo List**: Islamic-minded task management
- **Weather & Time**: Local weather and time display
- **Customizable Settings**: Choose languages, reciters, and translations

## Prerequisites

**IMPORTANT**: The IlmTab server must be running before installing the extension.

1. Navigate to the `server` directory
2. Run `npm install` then `npm start`
3. Ensure the server is running on `http://localhost:4000`

## Browser Support

| Browser           | Support      | Instructions              |
| ----------------- | ------------ | ------------------------- |
| ✅ Chrome         | Full Support | Use default manifest.json |
| ✅ Microsoft Edge | Full Support | Use default manifest.json |
| ✅ Brave          | Full Support | Use default manifest.json |
| ✅ Firefox        | Full Support | Use manifest-firefox.json |
| ✅ Opera          | Full Support | Use default manifest.json |
| ❓ Safari         | Limited      | Requires Xcode conversion |

## Installation Instructions

### Chrome, Edge, Brave, Opera (Chromium-based browsers):

1. **Download**: Extract the `ilmtab-extension` folder from the project
2. **Open Extensions Page**:
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`
   - Brave: Navigate to `brave://extensions/`
   - Opera: Navigate to `opera://extensions/`
3. **Enable Developer Mode**: Toggle ON "Developer mode" (top right corner)
4. **Load Extension**: Click "Load unpacked" button
5. **Select Folder**: Choose the `ilmtab-extension` folder
6. **Verify**: The extension should appear in your extensions list

### Firefox:

1. **Download**: Extract the `ilmtab-extension` folder from the project
2. **Prepare Manifest**:
   - Rename `manifest-firefox.json` to `manifest.json` (replace existing)
3. **Open Firefox**: Navigate to `about:debugging`
4. **Load Extension**:
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file in the extension folder
5. **Verify**: The extension should appear in your add-ons list

### Safari (macOS):

Safari extensions require conversion using Xcode:

1. Install Xcode from the Mac App Store
2. Use Safari's Web Extension Converter tool
3. Convert the extension to Safari format
4. Build and install through Xcode

_Note: Safari support requires additional development setup_

## Testing

1. Open a new tab in your browser
2. You should see the IlmTab interface instead of the default new tab page
3. Verify that Islamic content loads properly
4. Test audio playback and other features

## Troubleshooting

### Common Issues:

- **CORS Errors**: Ensure the server is running with updated CORS configuration
- **Content Not Loading**: Check that `http://localhost:4000` is accessible
- **Extension Not Loading**: Verify you selected the correct folder containing:
  - `index.html`
  - `manifest.json`
  - `assets/` folder

### Browser-Specific Issues:

**Firefox**:

- Make sure you renamed `manifest-firefox.json` to `manifest.json`
- Firefox loads extensions as "temporary" - they'll be removed when Firefox closes

**Chrome/Edge**:

- Ensure Developer Mode is enabled
- Check for any console errors in the extension details

## Building Your Own Package

To create your own extension package:

1. Run the build script: `node create-browser-extensions.js`
2. This will generate the extension files with both manifests
3. Follow the installation steps above for your preferred browser

## Features Overview

### Islamic Content

- Random Quran verses with authentic translations
- Daily hadith from Bukhari, Muslim, Tirmidhi, and other collections
- Audio recitation with multiple renowned reciters

### Productivity Tools

- Islamic todo list with mindful task management
- Current time and weather display

### Customization

- Multiple language support (Arabic, English, Urdu, etc.)
- Various Quran translations and tafsir
- Audio reciter selection
- Personal favorites collection

## Support

For issues, questions, or feature requests:

- Check the troubleshooting section above
- Review the project documentation
- Create an issue in the repository

---

**Version**: 0.1.0  
**Last Updated**: December 2024  
**Compatibility**: Modern browsers with extension support
