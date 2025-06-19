# IlmTab - Standalone Browser Extension v1.3.0

## 🎉 What's New in v1.3.0

This version introduces **standalone functionality** - the extension now works completely independently without requiring a backend server!

### ✨ Key Features

- **🔄 Fully Standalone**: No backend server required - all APIs are called directly from the browser
- **📖 Quranic Verses**: Daily verses with multiple translations and audio recitations
- **📚 Authentic Hadith**: From major collections (Sahih Bukhari, Sahih Muslim, etc.)
- **🔍 Quran Search**: Search through verses and navigate directly to them
- **⭐ Favorites**: Save and organize your favorite verses and hadith
- **🎨 Beautiful Backgrounds**: Curated Islamic imagery from Unsplash
- **🌍 Islamic Calendar**: Prayer times and Islamic date
- **☁️ Weather Integration**: Location-based weather information
- **✅ Task Management**: Built-in todo list for productivity
- **⚙️ Customizable Settings**: Personalize your experience

### 🔧 Technical Improvements

- **Client-Side API Layer**: Direct API calls to Islamic content providers
- **3-Tier Fallback System**: Ensures content is always available
- **Offline Fallback Data**: Curated verses and hadith for when APIs are unavailable
- **Optimized Performance**: Faster loading and better caching
- **Enhanced Security**: Updated Content Security Policy for external APIs

### 📦 Installation

1. Download `ilmtab-extension-standalone-v1.3.0.zip`
2. Extract the contents
3. Open Chrome/Edge and go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the extracted folder
6. For Firefox: Use `manifest-firefox.json` instead

### 🔗 API Sources

The extension now connects directly to:

- **Quran API**: api.alquran.cloud & api.quran.com
- **Hadith API**: hadithapi.com
- **Prayer Times**: api.aladhan.com
- **Weather**: api.open-meteo.com
- **Images**: Unsplash API

### 🛡️ Privacy & Security

- All data stored locally in browser storage
- No personal data sent to external servers
- Secure HTTPS connections to Islamic content APIs
- Minimal permissions required

### 🎯 Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Edge (Manifest V3)
- ✅ Firefox (Manifest V2 - use manifest-firefox.json)

### 🔄 Migration from Server Version

If you were using the previous server-dependent version:

1. Uninstall the old extension
2. Install this standalone version
3. Your settings and favorites will be preserved (stored locally)

### 🐛 Troubleshooting

**Extension not loading content?**

- Check internet connection
- Ensure the extension has proper permissions
- Try refreshing the new tab page

**API calls failing?**

- The extension includes fallback data for offline use
- Some corporate networks may block external API calls

### 📝 Changelog

**v1.3.0 (Standalone Release)**

- ✅ Removed backend server dependency
- ✅ Added client-side API layer
- ✅ Implemented 3-tier fallback system
- ✅ Added offline fallback data
- ✅ Updated manifest permissions
- ✅ Enhanced error handling
- ✅ Improved performance and caching

### 🤝 Contributing

This is an open-source project. Contributions are welcome!

### 📄 License

MIT License - See LICENSE file for details

---

**May Allah bless your journey of learning and remembrance** 🤲
