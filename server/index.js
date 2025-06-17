import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
import ayatRoutes from './routes/ayat.js';
import tafsirRoutes from './routes/tafsir.js';
import hadithRoutes from './routes/hadith.js';

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost origins
    if (origin.includes('localhost')) return callback(null, true);
    
    // Allow Chrome extension origins
    if (origin.startsWith('chrome-extension://')) return callback(null, true);
    
    // Allow the configured CORS origin
    if (origin === (process.env.CORS_ORIGIN || 'http://localhost:5173')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

// Use the ayat routes
app.use('/api/ayat', ayatRoutes);
app.use('/api/tafsir', tafsirRoutes);
app.use('/api/hadith', hadithRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
