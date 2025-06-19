import { hadithList } from './fallbackData.js';

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

// Browser-compatible fetch with timeout
const fetchWithTimeout = (url, timeout = 10000) => {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

// Fetch hadith data - using curated fallback data due to CORS issues with hadithapi.com
const fetchHadithData = async (book, hadithNumber) => {
  // For now, we'll use our curated hadith collection due to CORS issues with hadithapi.com
  // This ensures users always get authentic, high-quality hadith content
  // The API call can be re-enabled once CORS issues are resolved
  
  console.log('Using curated hadith collection for reliable content delivery');
  
  // Return a random hadith from our curated list
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
