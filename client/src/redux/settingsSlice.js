// src/redux/settingsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const SETTINGS_VERSION = "1.1.0"; // Increment this when adding new settings

const loadSettingsFromLocalStorage = () => {
  try {
    const savedSettings = localStorage.getItem("settings");
    if (!savedSettings) return null;
    
    const parsed = JSON.parse(savedSettings);
    
    // Check if settings need migration
    if (!parsed.version || parsed.version !== SETTINGS_VERSION) {
      console.log("Settings version mismatch, migrating settings...");
      return migrateSettings(parsed);
    }
    
    return parsed;
  } catch (e) {
    console.error("Error loading settings:", e);
    return null;
  }
};

const migrateSettings = (oldSettings) => {
  // Start with default settings
  const migratedSettings = { ...defaultState };
  
  // Preserve existing settings that are still valid
  if (oldSettings) {
    // Merge existing settings with new defaults
    if (oldSettings.ayah) {
      migratedSettings.ayah = { ...migratedSettings.ayah, ...oldSettings.ayah };
    }
    if (oldSettings.weather) {
      migratedSettings.weather = { ...migratedSettings.weather, ...oldSettings.weather };
    }
    if (oldSettings.hadith) {
      migratedSettings.hadith = { ...migratedSettings.hadith, ...oldSettings.hadith };
    }
    if (oldSettings.greetings) {
      migratedSettings.greetings = { ...migratedSettings.greetings, ...oldSettings.greetings };
    }
    // Tasks setting might not exist in old settings, so it will use the default
    if (oldSettings.tasks) {
      migratedSettings.tasks = { ...migratedSettings.tasks, ...oldSettings.tasks };
    }
  }
  
  // Add version to migrated settings
  migratedSettings.version = SETTINGS_VERSION;
  
  // Save the migrated settings
  saveSettingsToLocalStorage(migratedSettings);
  
  console.log("Settings migrated successfully to version", SETTINGS_VERSION);
  return migratedSettings;
};

const saveSettingsToLocalStorage = (settings) => {
  try {
    localStorage.setItem("settings", JSON.stringify(settings));
  } catch (e) {
    console.error("Error saving settings:", e);
  }
};

const defaultState = {
  version: SETTINGS_VERSION,
  ayah: {
    tafsirLanguage: "english",
    tafsirId: "169",
    textEdition: {
      language: "en",
      identifier: "en.asad",
    },
    audioEdition: {
      identifier: "ar.alafasy",
      englishName: "Mishary Rashid Alafasy",
    },
  },
  weather: {
    enabled: true,
    location: {
      name: "Toronto",
      country: "Canada",
      admin1: "Ontario",
      latitude: 43.65107,
      longitude: -79.347015,
    },
    customName: "",
    timeFormat: "12h", // or "24h"
    temperatureUnit: "celsius", // or "fahrenheit"
  },
  hadith: {
    book: "sahih-bukhari",
    translationLanguage: "en", // "en" or "ur"
  },
  greetings: {
    enabled: true,
    name: "John Doe"
  },
  tasks: {
    enabled: true
  }
};

const initialState = loadSettingsFromLocalStorage() || defaultState;

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
  setTafsirLanguage(state, action) {
    state.ayah.tafsirLanguage = action.payload;
    state.ayah.tafsirId = "";
    saveSettingsToLocalStorage(state);
  },
  setTafsirId(state, action) {
    state.ayah.tafsirId = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setTextEditionLanguage(state, action) {
    state.ayah.textEdition.language = action.payload;
    state.ayah.textEdition.identifier = "";
    saveSettingsToLocalStorage(state);
  },
  setTextEditionIdentifier(state, action) {
    state.ayah.textEdition.identifier = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setAudioEdition(state, action) {
    state.ayah.audioEdition = action.payload;
    saveSettingsToLocalStorage(state);
  },

  // --- New Weather/DateTime reducers ---
  setWeatherEnabled(state, action) {
    state.weather.enabled = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setLocation(state, action) {
    state.weather.location = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setCustomLocationName(state, action) {
    state.weather.customName = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setTimeFormat(state, action) {
    state.weather.timeFormat = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setTemperatureUnit(state, action) {
    state.weather.temperatureUnit = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setHadithBook(state, action) {
  state.hadith.book = action.payload;
  saveSettingsToLocalStorage(state);
  },
  setHadithTranslationLanguage(state, action) {
  state.hadith.translationLanguage = action.payload;
  saveSettingsToLocalStorage(state);
  },
  setGreetingsEnabled: (state, action) => {
    state.greetings.enabled = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setName: (state, action) => {
    state.greetings.name = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setTasksEnabled: (state, action) => {
    state.tasks.enabled = action.payload;
    saveSettingsToLocalStorage(state);
  }
  }
});

export const {
  setTafsirLanguage,
  setTafsirId,
  setTextEditionLanguage,
  setTextEditionIdentifier,
  setAudioEdition,
  setWeatherEnabled,
  setLocation,
  setCustomLocationName,
  setTimeFormat,
  setTemperatureUnit,
  setHadithBook,
  setHadithTranslationLanguage,
  setGreetingsEnabled,
  setName,
  setTasksEnabled
} = settingsSlice.actions;

export default settingsSlice.reducer;
