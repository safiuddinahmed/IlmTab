# 🌙 IlmTab - Your Daily Islamic Knowledge Companion

IlmTab is a transformative browser extension that turns your new tab into a spiritual sanctuary. Every time you open a new tab, you're greeted with daily Quranic verses, authentic Hadith, and Islamic productivity tools, keeping you connected to your faith throughout your browsing experience.

## 🌟 Features

### 📖 Islamic Content

- **Daily Quran Verses**: Random Ayah display with multiple translations and audio recitations
- **Hadith Collection**: Authentic Hadith from major collections (Bukhari, Muslim, Tirmidhi, etc.)
- **Tafsir Integration**: Detailed commentary and explanations for Quranic verses
- **Audio Recitations**: High-quality Quran recitations from renowned Qaris
- **Favorites System**: Save and organize your favorite verses and Hadith

### 🎨 Productivity & Wellness

- **Islamic Calendar**: Hijri date display with important Islamic events
- **Prayer Time Awareness**: Integrated with daily Islamic schedule
- **Todo List**: Organize your daily tasks and goals
- **Soft Reminders**: Gentle Islamic reminders and motivational content
- **Weather Integration**: Current weather conditions for your location

### ⚙️ Customization

- **Multiple Languages**: Support for Arabic, English, and other languages
- **Audio Preferences**: Choose from various renowned Qaris
- **Personalized Greetings**: Islamic greetings based on time of day
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/safiuddinahmed/ilmtab.git
   cd ilmtab
   ```

2. **Install dependencies**

   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment template
   cd ../server
   cp .env.example .env
   ```

4. **Configure API Keys** (Edit `server/.env`)

   ```env
   # Hadith API Configuration
   HADITH_API_KEY=your_hadith_api_key_here

   # Unsplash API Configuration (for background images)
   UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

   # Server Configuration
   PORT=4000
   NODE_ENV=development

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

5. **Start the application**

   ```bash
   # Start the server (from server directory)
   npm run dev

   # In a new terminal, start the client (from client directory)
   cd ../client
   npm run dev
   ```

6. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - The server will be running on `http://localhost:4000`

## 🔧 API Configuration

### Required API Keys

#### Hadith API

- **Purpose**: Fetches authentic Hadith collections
- **How to get**: Visit [Hadith API](https://hadithapi.com/) and sign up for a free account
- **Usage**: Free tier includes sufficient requests for personal use

#### Unsplash API (Optional)

- **Purpose**: Provides beautiful background images
- **How to get**: Visit [Unsplash Developers](https://unsplash.com/developers) and create an application
- **Usage**: Free tier includes 50 requests per hour

### API Endpoints

The server provides the following endpoints:

- `GET /api/ayat/random` - Get a random Quran verse
- `GET /api/hadith/random` - Get a random Hadith
- `GET /api/tafsir/:surah/:ayah` - Get Tafsir for specific verse
- `GET /health` - Health check endpoint

## 📱 Usage

### Daily Workflow

1. **Morning**: Start your day with a random Ayah and its meaning
2. **Planning**: Use the todo list to organize your daily tasks
3. **Learning**: Read Hadith and explore Tafsir for deeper understanding
4. **Reflection**: Save meaningful verses and Hadith to your favorites
5. **Evening**: Review your accomplishments and spiritual growth

### Key Features Guide

#### Favorites System

- Click the heart icon on any Ayah or Hadith to save it
- Access your favorites through the favorites modal
- Organize your saved content for easy reference

#### Audio Recitations

- Click the play button on any Ayah to hear its recitation
- Choose from multiple renowned Qaris in settings
- Adjust playback speed and volume as needed

#### Settings Customization

- Access settings through the gear icon
- Customize language preferences
- Select preferred Qari for audio recitations
- Adjust display preferences

## 🛠️ Development

### Project Structure

```
ilmtab/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── redux/         # State management
│   │   ├── constants/     # Configuration constants
│   │   └── App.jsx        # Main application component
│   ├── public/            # Static assets
│   └── package.json       # Client dependencies
├── server/                # Express backend
│   ├── routes/           # API route handlers
│   ├── data/             # Static data files
│   ├── index.js          # Server entry point
│   └── package.json      # Server dependencies
└── README.md             # This file
```

### Available Scripts

#### Client (React + Vite)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Server (Express)

```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
```

### Technology Stack

#### Frontend

- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Redux Toolkit**: State management for favorites and settings
- **CSS3**: Custom styling with modern CSS features
- **Responsive Design**: Mobile-first approach

#### Backend

- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## 🤝 Contributing

We welcome contributions to IlmTab! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Implement your feature or bug fix
4. **Test thoroughly**: Ensure your changes work as expected
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe your changes and their benefits

### Development Guidelines

- Follow existing code style and conventions
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed
- Respect Islamic values and content accuracy

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Quran API**: For providing access to Quranic text and translations
- **Hadith API**: For authentic Hadith collections
- **Islamic Community**: For guidance and feedback on Islamic content accuracy
- **Open Source Contributors**: For their valuable contributions and suggestions

## 📞 Support

If you encounter any issues or have questions:

1. **Check the documentation**: Most common issues are covered here
2. **Search existing issues**: Someone might have already reported the problem
3. **Create a new issue**: Provide detailed information about the problem
4. **Join our community**: Connect with other users and contributors

## 🔮 Roadmap

### Upcoming Features

- [ ] Prayer time notifications
- [ ] Islamic calendar events
- [ ] Quran reading progress tracking
- [ ] Offline mode support
- [ ] Mobile app version
- [ ] Multiple theme options
- [ ] Advanced search functionality
- [ ] Social sharing features

### Long-term Goals

- Integration with Islamic learning platforms
- Community features for sharing insights
- Advanced analytics for spiritual growth tracking
- Multi-language support expansion
- Accessibility improvements

---

**May Allah (SWT) bless this project and make it beneficial for the Muslim Ummah. Ameen.**

_"And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose."_ - Quran 65:3
