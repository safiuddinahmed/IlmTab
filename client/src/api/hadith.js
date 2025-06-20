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

// Fetch hadith data from hadithapi.com with fallback
const fetchHadithData = async (book, hadithNumber) => {
  console.log('Fetching hadith:', hadithNumber, 'from book:', book);
  
  try {
    // Construct API URL using correct format
    let apiUrl;
    
    if (hadithNumber) {
      // Fetch specific hadith
      apiUrl = `https://hadithapi.com/api/hadiths/?apiKey=${HADITH_API_KEY}&hadithNumber=${hadithNumber}&book=${book}&status=Sahih`;
    } else {
      // Fetch random hadith (without hadithNumber parameter)
      apiUrl = `https://hadithapi.com/api/hadiths/?apiKey=${HADITH_API_KEY}&book=${book}&status=Sahih`;
    }
    
    console.log('Making API call to:', apiUrl);
    
    // Make API call with timeout
    const response = await fetchWithTimeout(apiUrl, 8000);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response received:', data);
    
    // Transform API response to match our expected format
    if (data && data.hadiths && data.hadiths.length > 0) {
      const hadith = data.hadiths[0]; // Get first hadith from results
      
      return {
        number: hadith.hadithNumber || hadithNumber,
        book: hadith.book?.name || book,
        volume: hadith.volume || "1",
        writer: hadith.book?.writer || "Unknown",
        bookSlug: book,
        narrator: {
          english: hadith.hadithEnglish?.narrator || "",
          urdu: hadith.hadithUrdu?.narrator || ""
        },
        text: {
          english: hadith.hadithEnglish?.body || "",
          urdu: hadith.hadithUrdu?.body || "",
          arabic: hadith.hadithArabic?.body || ""
        },
        heading: {
          english: hadith.headingEnglish || "",
          urdu: hadith.headingUrdu || "",
          arabic: hadith.headingArabic || ""
        },
        chapter: {
          chapterNumber: hadith.chapterNumber || "0",
          english: hadith.chapterEnglish || "",
          urdu: hadith.chapterUrdu || "",
          arabic: hadith.chapterArabic || ""
        },
        status: hadith.status || "Sahih"
      };
    }
    
    throw new Error('Invalid API response format or no hadiths found');
    
  } catch (error) {
    console.warn('API call failed, using fallback data:', error.message);
    
    // Fallback to curated hadith collection
    if (hadithNumber && !isNaN(hadithNumber)) {
      const index = Math.max(0, Math.min(parseInt(hadithNumber) - 1, hadithList.length - 1));
      const selectedHadith = { ...hadithList[index] };
      selectedHadith.number = hadithNumber;
      return selectedHadith;
    }
    
    // Return random fallback hadith
    const randomIndex = Math.floor(Math.random() * hadithList.length);
    const randomHadith = { ...hadithList[randomIndex] };
    randomHadith.number = randomIndex + 1;
    return randomHadith;
  }
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
