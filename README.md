# 🌙 IlmTab - Your Daily Islamic Knowledge Companion

_Transform every new browser tab into a moment of spiritual reflection and learning_

IlmTab is a beautiful Chrome browser extension that replaces your new tab page with daily Islamic knowledge, featuring Quranic verses, authentic Hadith, Islamic date, and productivity tools - all designed to keep you connected to your faith throughout your digital day.

## ✨ Features

### 📖 Islamic Content

- **Random Quranic Verses**: Daily ayahs with multiple translations and audio recitations
- **Authentic Hadith**: Curated hadith from major collections (Bukhari, Muslim, Tirmidhi, etc.)
- **Multiple Languages**: Support for Arabic, English, Urdu, and other languages
- **Audio Recitations**: High-quality Quran recitations from renowned qaris
- **Tafsir Integration**: Detailed explanations and interpretations of verses

### 🎨 Beautiful Interface

- **Dynamic Backgrounds**: Stunning nature photography from Unsplash
- **Islamic Calendar**: Hijri date display alongside Gregorian calendar
- **Responsive Design**: Works seamlessly on all screen sizes
- **Modern UI**: Clean, Material-UI based design with glassmorphism effects

### 📚 Personal Features

- **Favorites System**: Save and organize your favorite verses and hadith
- **Personal Notes**: Add reflections and notes to saved content
- **To-Do List**: Islamic-themed task management
- **Personalized Greetings**: Customizable Islamic greetings
- **Weather Integration**: Current weather with Islamic date

### ⚙️ Customization

- **Multiple Reciters**: Choose from various renowned Quran reciters
- **Translation Options**: Multiple translation sources and languages
- **Hadith Collections**: Select from major hadith books
- **Location Settings**: Automatic or manual location for weather
- **Content Preferences**: Toggle features on/off as needed

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Chrome browser

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ilmtab.git
   cd ilmtab
   ```

2. **Set up the backend server**

   ```bash
   cd server
   npm install

   # Create environment file (optional)
   cp .env.example .env

   # Start the development server
   npm run dev
   ```

   The server will run on `http://localhost:4000`

3. **Set up the frontend client**

   ```bash
   cd ../client
   npm install

   # Build the extension
   npm run build
   ```

4. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `client/dist` folder
   - The extension should now be loaded and active

### Development Mode

For development with hot reloading:

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend development server
cd client
npm run dev
```

Then load the `client` folder (not dist) as an unpacked extension in Chrome.

## 🏗️ Project Structure

```
ilmtab/
├── client/                 # Frontend React application
│   ├── public/            # Static assets and manifest
│   │   ├── manifest.json  # Chrome extension manifest
│   │   └── index.html     # Main HTML file
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── AyahCard.jsx       # Quran verse display
│   │   │   ├── HadithCard.jsx     # Hadith display
│   │   │   ├── AudioPlayer.jsx    # Audio recitation player
│   │   │   ├── DateTimeWeather.jsx # Date, time, weather
│   │   │   ├── FavoritesModal.jsx  # Favorites management
│   │   │   ├── SettingsModal.jsx   # Settings panel
│   │   │   ├── ToDoList.jsx       # Task management
│   │   │   └── ...
│   │   ├── redux/         # State management
│   │   │   ├── favoritesSlice.js  # Favorites state
│   │   │   └── settingsSlice.js   # Settings state
│   │   ├── constants/     # Configuration data
│   │   │   ├── audioEditions.js   # Audio reciters
│   │   │   ├── textEditions.js    # Text translations
│   │   │   ├── hadithBooks.js     # Hadith collections
│   │   │   └── tafsirsByLanguage.js # Tafsir sources
│   │   ├── App.jsx        # Main application component
│   │   └── store.js       # Redux store configuration
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite build configuration
├── server/                # Backend Express server
│   ├── routes/           # API endpoints
│   │   ├── ayat.js       # Quran verses API
│   │   ├── hadith.js     # Hadith API
│   │   ├── tafsir.js     # Tafsir API
│   │   └── health.js     # Health check
│   ├── data/            # Static data files
│   │   └── ayat.js      # Quran data
│   ├── index.js         # Server entry point
│   ├── package.json     # Backend dependencies
│   └── .env.example     # Environment variables template
├── setup-ilmtab.js      # Automated setup script
└── README.md            # This file
```

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file in the `server` directory:

```env
PORT=4000
NODE_ENV=development
# Add any API keys for external services here
```

### Chrome Extension Permissions

The extension requires the following permissions:

- `storage`: To save user preferences and favorites
- `chrome_url_overrides`: To replace the new tab page

## 🎯 Usage

### Basic Navigation

- **Switch Modes**: Use arrow buttons to toggle between Ayah and Hadith modes
- **Navigate Content**: Use next/previous buttons to browse verses/hadith
- **Continuous Mode**: Enable to read sequentially through content
- **Favorites**: Click the heart icon to save content for later

### Customization

1. Click the **Settings** icon (⚙️) in the bottom left
2. Configure your preferences:
   - **Language**: Choose your preferred language for translations
   - **Reciter**: Select your favorite Quran reciter
   - **Location**: Set your location for accurate weather information
   - **Hadith Collection**: Choose which hadith books to display
   - **Features**: Toggle weather, greetings, and tasks on/off

### Managing Favorites

1. Click the **Favorites** icon (❤️) in the bottom left
2. Browse your saved verses and hadith
3. Add personal notes and reflections
4. Organize and manage your collection

## 🛠️ Development

### Adding New Features

1. **New Components**: Add React components in `client/src/components/`
2. **API Endpoints**: Add new routes in `server/routes/`
3. **State Management**: Extend Redux slices in `client/src/redux/`
4. **Styling**: Use Material-UI components and custom CSS

### Building for Production

```bash
# Build the extension
cd client
npm run build

# The built extension will be in client/dist/
# Load this folder as an unpacked extension in Chrome
```

### Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
npm test
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Quran API**: Thanks to various Quran API providers for verse data
- **Hadith Collections**: Authentic hadith from classical Islamic sources
- **Unsplash**: Beautiful background photography
- **Material-UI**: React component library
- **Islamic Community**: For feedback and feature suggestions

## 📞 Support

- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/yourusername/ilmtab/issues)
- **Discussions**: Join community discussions on [GitHub Discussions](https://github.com/yourusername/ilmtab/discussions)
- **Email**: Contact me at safiuddinahmed.mohammad@gmail.com

## 🔄 Changelog

### v0.1.0 (Current)

- Initial release
- Basic Quran and Hadith display
- Favorites system
- Settings panel
- Weather integration
- To-do list functionality

---

_May Allah (SWT) accept this humble effort and make it a source of benefit for the Muslim ummah. Ameen._

**"And whoever does righteous deeds, whether male or female, while being a believer - those will enter Paradise and will not be wronged, [even as much as] the speck on a date seed."** - Quran 4:124
