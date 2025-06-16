// src/redux/settingsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const SETTINGS_VERSION = "1.2.0"; // Increment this when adding new settings

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
    if (oldSettings.tasks) {
      migratedSettings.tasks = { ...migratedSettings.tasks, ...oldSettings.tasks };
    }
    // Background settings will use defaults for new installations
    if (oldSettings.background) {
      migratedSettings.background = { ...migratedSettings.background, ...oldSettings.background };
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
    // Create a plain object copy to avoid Redux Toolkit's Proxy issues
    const plainSettings = JSON.parse(JSON.stringify(settings));
    const settingsString = JSON.stringify(plainSettings);
    
    // Check size before saving
    const sizeInMB = (settingsString.length * 2) / (1024 * 1024); // Rough estimate
    console.log(`Settings size: ${sizeInMB.toFixed(2)}MB`);
    
    localStorage.setItem("settings", settingsString);
    console.log("Settings saved to localStorage successfully");
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error("localStorage quota exceeded. Clearing uploaded images to free space...");
      
      // Try to save without uploaded images as fallback
      try {
        const fallbackSettings = { ...settings };
        if (fallbackSettings.background) {
          fallbackSettings.background.uploadedImages = [];
        }
        const fallbackString = JSON.stringify(JSON.parse(JSON.stringify(fallbackSettings)));
        localStorage.setItem("settings", fallbackString);
        console.log("Settings saved without uploaded images as fallback");
        
        // Show user-friendly error
        alert("Storage limit reached. Uploaded images have been cleared to save other settings. Please upload smaller images or fewer images.");
      } catch (fallbackError) {
        console.error("Failed to save even fallback settings:", fallbackError);
        alert("Storage limit exceeded. Please clear your browser data or use smaller images.");
      }
    } else {
      console.error("Error saving settings:", e);
    }
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
    name: "User"
  },
  tasks: {
    enabled: true
  },
  background: {
    refreshInterval: "newtab", // "newtab", "5min", "15min", "30min", "1hour", "1day", "1week"
    lastRefreshTime: null,
    currentImageUrl: null,
    fallbackImageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
    imageSource: "category", // "category", "upload"
    islamicCategory: "nature", // "nature", "architecture", "calligraphy", "geometric"
    uploadedImages: [], // Array of uploaded images (max 10)
    currentUploadedImageIndex: 0, // Track current image in sequence
    blurIntensity: 0, // 0-10 blur level
    opacity: 100 // 50-100 opacity percentage
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

  // --- Weather/DateTime reducers ---
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
  },

  // --- Background reducers ---
  setBackgroundRefreshInterval: (state, action) => {
    state.background.refreshInterval = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setBackgroundLastRefreshTime: (state, action) => {
    state.background.lastRefreshTime = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setBackgroundCurrentImageUrl: (state, action) => {
    state.background.currentImageUrl = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setBackgroundFallbackImageUrl: (state, action) => {
    state.background.fallbackImageUrl = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setBackgroundImageSource: (state, action) => {
    state.background.imageSource = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setBackgroundIslamicCategory: (state, action) => {
    state.background.islamicCategory = action.payload;
    saveSettingsToLocalStorage(state);
  },
  addBackgroundUploadedImage: (state, action) => {
    // Add new image to the array (max 10)
    if (state.background.uploadedImages.length < 10) {
      const newImage = {
        id: Date.now(),
        url: action.payload,
        name: `Image ${state.background.uploadedImages.length + 1}`
      };
      state.background.uploadedImages.push(newImage);
      console.log("Added image to Redux state:", newImage.name, "Total images:", state.background.uploadedImages.length);
    }
    saveSettingsToLocalStorage(state);
  },
  removeBackgroundUploadedImage: (state, action) => {
    state.background.uploadedImages = state.background.uploadedImages.filter(
      img => img.id !== action.payload
    );
    saveSettingsToLocalStorage(state);
  },
  setBackgroundBlurIntensity: (state, action) => {
    state.background.blurIntensity = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setBackgroundOpacity: (state, action) => {
    state.background.opacity = action.payload;
    saveSettingsToLocalStorage(state);
  },
  setBackgroundCurrentUploadedImageIndex: (state, action) => {
    state.background.currentUploadedImageIndex = action.payload;
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
  setTasksEnabled,
  setBackgroundRefreshInterval,
  setBackgroundLastRefreshTime,
  setBackgroundCurrentImageUrl,
  setBackgroundFallbackImageUrl,
  setBackgroundImageSource,
  setBackgroundIslamicCategory,
  addBackgroundUploadedImage,
  removeBackgroundUploadedImage,
  setBackgroundBlurIntensity,
  setBackgroundOpacity,
  setBackgroundCurrentUploadedImageIndex
} = settingsSlice.actions;

export default settingsSlice.reducer;
