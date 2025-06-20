import { hadithList } from './fallbackData.js';

// All supported Hadith books with counts for basic random logic
// Keep original totals for proper navigation range, even though we use fallback data
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

// Browser-compatible fetch with timeout and CORS handling
const fetchWithTimeout = (url, timeout = 10000) => {
  return Promise.race([
    fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit' // Don't send credentials for CORS
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

// Fetch hadith data from hadithapi.com with fallback (matches backend implementation)
const fetchHadithData = async (book, hadithNumber) => {
  console.log('Fetching hadith:', hadithNumber, 'from book:', book);
  
  // Try primary API first (hadithapi.com)
  try {
    const url = `https://hadithapi.com/api/hadiths/?apiKey=${HADITH_API_KEY}&hadithNumber=${hadithNumber}&book=${book}&status=Sahih`;
    console.log('Making API call to:', url);
    
    const response = await fetchWithTimeout(url, 8000);
    const json = await response.json();
    
    console.log('API response received:', json);

    // Match backend validation exactly
    if (response.ok && json.hadiths?.data?.[0]) {
      const hadith = json.hadiths.data[0];
      
      // Use exact same transformation as backend
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
    }
  } catch (error) {
    console.log('Primary Hadith API failed, using fallback...', error.message);
  }

  // Fallback - return a random hadith from our curated list
  const randomIndex = Math.floor(Math.random() * hadithList.length);
  return hadithList[randomIndex];
};

// Main API function that matches the backend endpoint exactly
export const fetchHadith = async (params = {}) => {
  try {
    const { book = DEFAULT_BOOK, hadithNumber } = params;

    const selectedBook = HADITH_BOOKS.find(b => b.slug === book);
    if (!selectedBook || selectedBook.total === 0) {
      throw new Error('Unsupported or empty hadith book.');
    }

    const number = hadithNumber
      ? parseInt(hadithNumber)
      : Math.floor(Math.random() * selectedBook.total) + 1;

    // Simple, lightweight fetch
    const result = await fetchHadithData(selectedBook.slug, number);
    
    return result;
  } catch (err) {
    console.error(err);
    throw new Error(err.message || 'Internal server error');
  }
};

// Export default for backward compatibility
export default { fetchHadith };
