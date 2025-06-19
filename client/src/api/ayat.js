import { ayatList } from './fallbackData.js';

const MAX_AYAH = 6236;

// Browser-compatible fetch with timeout
const fetchWithTimeout = (url, timeout = 8000) => {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

// Fetch ayah data with 3-tier fallback system (same as backend)
const fetchAyahData = async (ayahIdentifier, textEdition, audioEdition) => {
  // Try primary API first (alquran.cloud)
  try {
    const [textResponse, audioResponse] = await Promise.all([
      fetchWithTimeout(`http://api.alquran.cloud/v1/ayah/${ayahIdentifier}/${textEdition}`),
      fetchWithTimeout(`http://api.alquran.cloud/v1/ayah/${ayahIdentifier}/${audioEdition}`)
    ]);

    if (textResponse.ok && audioResponse.ok) {
      const textData = await textResponse.json();
      const audioData = await audioResponse.json();
      const d = textData.data;
      const a = audioData.data;

      return {
        number: d.number,
        text: d.text,
        arabicText: a.text,
        editionName: d.edition.englishName,
        sajda: d.sajda,
        surah: {
          number: d.surah.number,
          name: d.surah.name,
          englishNameTranslation: d.surah.englishNameTranslation,
          numberOfAyahs: d.surah.numberOfAyahs,
          ayahNumberInSurah: d.numberInSurah,
          revelationType: d.surah.revelationType,
        },
        audio: {
          main: a.audio,
          secondary: a.audioSecondary,
        }
      };
    }
  } catch (error) {
    console.log('Primary API failed, trying fallback...', error.message);
  }

  // Fallback to alternative API (quran.com)
  try {
    // Parse ayah identifier to get surah and ayah numbers
    let surahNum, ayahNum;
    if (typeof ayahIdentifier === 'string' && ayahIdentifier.includes(':')) {
      [surahNum, ayahNum] = ayahIdentifier.split(':').map(Number);
    } else {
      // Convert absolute ayah number to surah:ayah format
      // This is a simplified conversion - in production you'd want a proper lookup table
      const ayahNumber = parseInt(ayahIdentifier);
      surahNum = Math.min(Math.floor(ayahNumber / 50) + 1, 114); // Rough approximation
      ayahNum = Math.max(1, ayahNumber % 50 || 1);
    }

    const response = await fetchWithTimeout(`https://api.quran.com/api/v4/verses/by_key/${surahNum}:${ayahNum}?translations=20&audio=7`);
    
    if (response.ok) {
      const data = await response.json();
      const verse = data.verse;
      
      return {
        number: verse.id,
        text: verse.translations?.[0]?.text || "Translation not available",
        arabicText: verse.text_uthmani || verse.text_simple,
        editionName: "Fallback Translation",
        sajda: false,
        surah: {
          number: surahNum,
          name: `Surah ${surahNum}`,
          englishNameTranslation: `Chapter ${surahNum}`,
          numberOfAyahs: 50, // Placeholder
          ayahNumberInSurah: ayahNum,
          revelationType: "Unknown",
        },
        audio: {
          main: verse.audio?.url || "",
          secondary: "",
        }
      };
    }
  } catch (error) {
    console.log('Fallback API also failed:', error.message);
  }

  // Final fallback - return a random ayah from our curated list
  const randomAyah = ayatList[Math.floor(Math.random() * ayatList.length)];
  return {
    number: randomAyah.ayahNumber,
    text: randomAyah.translation.text,
    arabicText: randomAyah.arabicText,
    editionName: randomAyah.translation.author,
    sajda: false,
    surah: {
      number: randomAyah.surahNumber,
      name: randomAyah.surahName,
      englishNameTranslation: randomAyah.surahName,
      numberOfAyahs: 10, // Placeholder
      ayahNumberInSurah: randomAyah.ayahNumber,
      revelationType: "Meccan",
    },
    audio: {
      main: randomAyah.recitation.audioUrl,
      secondary: randomAyah.recitation.audioUrl.replace('128', '64'),
    }
  };
};

// Main API function that matches the backend endpoint exactly
export const fetchAyah = async (params = {}) => {
  try {
    const {
      text_edition = 'en.asad',
      audio_edition = 'ar.alafasy',
      surah,
      ayah
    } = params;

    let ayahIdentifier;
    if (surah && ayah) {
      ayahIdentifier = `${surah}:${ayah}`;
    } else {
      const randomAyahNumber = Math.floor(Math.random() * MAX_AYAH) + 1;
      ayahIdentifier = randomAyahNumber;
    }

    // Simple, lightweight fetch
    const result = await fetchAyahData(ayahIdentifier, text_edition, audio_edition);
    
    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error.message || 'Internal server error');
  }
};

// Export default for backward compatibility
export default { fetchAyah };
