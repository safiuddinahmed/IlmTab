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
  origin: process.env.CORS_ORIGIN || 'http://localhost:4000'
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
