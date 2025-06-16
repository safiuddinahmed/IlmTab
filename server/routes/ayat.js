import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

const MAX_AYAH = 6236;

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

    const [textResponse, audioResponse] = await Promise.all([
      fetch(`http://api.alquran.cloud/v1/ayah/${ayahIdentifier}/${text_edition}`),
      fetch(`http://api.alquran.cloud/v1/ayah/${ayahIdentifier}/${audio_edition}`)
    ]);

    if (!textResponse.ok || !audioResponse.ok) throw new Error('Failed to fetch ayah');

    const textData = await textResponse.json();
    const audioData = await audioResponse.json();
    const d = textData.data;
    const a = audioData.data;

    const result = {
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

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});


export default router;
