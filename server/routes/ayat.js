import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

const MAX_AYAH = 6236;

// Lightweight fetch function with timeout (no caching for browser extension)
const fetchAyahData = async (ayahIdentifier, textEdition, audioEdition) => {
  // Simple timeout wrapper
  const fetchWithTimeout = (url, timeout = 8000) => {
    return Promise.race([
      fetch(url),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  };
  
  const [textResponse, audioResponse] = await Promise.all([
    fetchWithTimeout(`http://api.alquran.cloud/v1/ayah/${ayahIdentifier}/${textEdition}`),
    fetchWithTimeout(`http://api.alquran.cloud/v1/ayah/${ayahIdentifier}/${audioEdition}`)
  ]);

  if (!textResponse.ok || !audioResponse.ok) {
    throw new Error('Failed to fetch ayah');
  }

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
};

router.get('/', async (req, res) => {
  try {
    const {
      text_edition = 'en.asad',
      audio_edition = 'ar.alafasy',
      surah,
      ayah
    } = req.query;

    let ayahIdentifier;
    if (surah && ayah) {
      ayahIdentifier = `${surah}:${ayah}`;
    } else {
      const randomAyahNumber = Math.floor(Math.random() * MAX_AYAH) + 1;
      ayahIdentifier = randomAyahNumber;
    }

    // Simple, lightweight fetch
    const result = await fetchAyahData(ayahIdentifier, text_edition, audio_edition);
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});


export default router;
