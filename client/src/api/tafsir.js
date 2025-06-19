// Tafsir API - Direct call to quran.com API (same as backend)

// Main API function that matches the backend endpoint exactly
export const fetchTafsir = async (params = {}) => {
  const { tafsirId, surah, ayah } = params;

  if (!tafsirId || !surah || !ayah) {
    throw new Error('Missing tafsirId, surah or ayah parameter');
  }

  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${surah}:${ayah}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch tafsir');
    }

    const data = await response.json();

    const tafsir = data.tafsir;

    if (!tafsir || !tafsir.text) {
      throw new Error('Tafsir not found for this ayah');
    }

    return {
      tafsir: tafsir.text,
      tafsirName: tafsir.translated_name?.name || tafsir.resource_name || null,
      languageName: tafsir.translated_name?.language_name || null,
      ayahKey: `${surah}:${ayah}`,
    };
  } catch (error) {
    console.error('Error fetching tafsir:', error);
    throw new Error(error.message || 'Internal server error');
  }
};

// Export default for backward compatibility
export default { fetchTafsir };
