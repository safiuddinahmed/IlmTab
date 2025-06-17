import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// All supported Hadith books with counts for basic random logic
const HADITH_BOOKS = [
  { slug: 'sahih-bukhari', total: 7276 },
  { slug: 'sahih-muslim', total: 7564 },
  { slug: 'al-tirmidhi', total: 3956 },
  { slug: 'abu-dawood', total: 5274 },
  { slug: 'ibn-e-majah', total: 4341 },
  { slug: 'sunan-nasai', total: 5761 },
  { slug: 'mishkat', total: 6293 },
  { slug: 'musnad-ahmad', total: 0 }, // may skip if API has no content
  { slug: 'al-silsila-sahiha', total: 0 }
];

const DEFAULT_BOOK = 'sahih-bukhari';
const HADITH_API_KEY = "$2y$10$J1BiN6U0xUa2Hp42HdsZgOcvVwc8lOPvEKEgdhqG7F1dsXjPbjka";

// Lightweight fetch function with timeout (no caching for browser extension)
const fetchHadithData = async (book, hadithNumber) => {
  // Simple timeout wrapper
  const fetchWithTimeout = (url, timeout = 10000) => {
    return Promise.race([
      fetch(url),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  };
  
  const url = `https://hadithapi.com/api/hadiths/?apiKey=${HADITH_API_KEY}&hadithNumber=${hadithNumber}&book=${book}&status=Sahih`;
  
  const response = await fetchWithTimeout(url);
  const json = await response.json();

  if (!response.ok || !json.hadiths?.data?.[0]) {
    throw new Error('Failed to fetch hadith');
  }

  const hadith = json.hadiths.data[0];
  return {
    number: hadith.hadithNumber,
    book: hadith.book.bookName,
    volume: hadith.volume,
    writer: hadith.book.writerName,
    bookSlug: hadith.bookSlug,
    narrator: {
      english: hadith.englishNarrator,
      urdu: hadith.urduNarrator
    },
    text: {
      english: hadith.hadithEnglish,
      urdu: hadith.hadithUrdu,
      arabic: hadith.hadithArabic
    },
    heading: {
      english: hadith.headingEnglish,
      urdu: hadith.headingUrdu,
      arabic: hadith.headingArabic
    },
    chapter: {
      chapterNumber: hadith.chapter.chapterNumber,
      english: hadith.chapter.chapterEnglish,
      urdu: hadith.chapter.chapterUrdu,
      arabic: hadith.chapter.chapterArabic
    },
    status: hadith.status
  };
};

router.get('/', async (req, res) => {
  try {
    const { book = DEFAULT_BOOK, hadithNumber } = req.query;

    const selectedBook = HADITH_BOOKS.find(b => b.slug === book);
    if (!selectedBook || selectedBook.total === 0) {
      return res.status(400).json({ error: 'Unsupported or empty hadith book.' });
    }

    const number = hadithNumber
      ? parseInt(hadithNumber)
      : Math.floor(Math.random() * selectedBook.total) + 1;

    // Simple, lightweight fetch
    const result = await fetchHadithData(selectedBook.slug, number);
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
