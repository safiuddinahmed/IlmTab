# IlmTab Chrome Extension Installation Guide

## What is IlmTab?

IlmTab is a Chrome extension that transforms your new tab page into an Islamic spiritual dashboard, featuring daily Quran verses, authentic Hadith, prayer times, and productivity tools.

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

1. **Server Setup**: The IlmTab server must be running on `http://localhost:4000`
   - Navigate to the `server` directory
   - Run `npm install` then `npm start`
   - Ensure the server is running before installing the extension

## Installation Steps

1. **Download**: Extract the `ilmtab-extension` folder from the project
2. **Open Chrome**: Launch Google Chrome browser
3. **Extensions Page**: Navigate to `chrome://extensions/`
4. **Developer Mode**: Toggle ON "Developer mode" (top right corner)
5. **Load Extension**: Click "Load unpacked" button
6. **Select Folder**: Choose the `ilmtab-extension` folder
7. **Verify**: The extension should appear in your extensions list

## Testing

1. Open a new tab in Chrome
2. You should see the IlmTab interface instead of the default new tab page
3. Verify that Islamic content loads properly
4. Test audio playback and other features

## Troubleshooting

- **CORS Errors**: Ensure the server is running with updated CORS configuration
- **Content Not Loading**: Check that `http://localhost:4000` is accessible
- **Extension Not Loading**: Verify you selected the correct folder containing:
  - `index.html`
  - `manifest.json`
  - `assets/` folder
  - `INSTALL.txt`

## Building Your Own Package

To create your own extension package:

1. Run the build script: `node create-test-package.js`
2. This will generate the extension files in the `ilmtab-extension` folder
3. Follow the installation steps above

## Support

For issues or questions, please refer to the project documentation or create an issue in the repository.
