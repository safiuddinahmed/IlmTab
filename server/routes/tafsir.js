// tafsir.js

import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/', async (req, res) => {
  const { tafsirId, surah, ayah } = req.query;

  if (!tafsirId || !surah || !ayah) {
    return res.status(400).json({ error: 'Missing tafsirId, surah or ayah parameter' });
  }

  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${surah}:${ayah}`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch tafsir' });
    }

    const data = await response.json();

    const tafsir = data.tafsir;

    if (!tafsir || !tafsir.text) {
      return res.status(404).json({ error: 'Tafsir not found for this ayah' });
    }

    res.json({
      tafsir: tafsir.text,
      tafsirName: tafsir.translated_name?.name || tafsir.resource_name || null,
      languageName: tafsir.translated_name?.language_name || null,
      ayahKey: `${surah}:${ayah}`,
    });
  } catch (error) {
    console.error('Error fetching tafsir:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;