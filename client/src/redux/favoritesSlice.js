import { createSlice } from "@reduxjs/toolkit";

const loadFavoritesFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem("favorites");
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Migrate from old individual entries if they exist
    const oldFavorites = Object.keys(localStorage)
      .filter(key => key.startsWith("favorite-"))
      .map(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          // Clean up old entries immediately
          localStorage.removeItem(key);
          return item;
        } catch (e) {
          console.error("Error migrating favorite:", key, e);
          localStorage.removeItem(key); // Remove corrupted entry
          return null;
        }
      })
      .filter(item => item !== null); // Remove null entries
    
    if (oldFavorites.length > 0) {
      // Save migrated favorites to new single-key format
      saveFavoritesToLocalStorage(oldFavorites);
      console.log("Migrated", oldFavorites.length, "favorites to single localStorage key");
      return oldFavorites;
    }
    
    return [];
  } catch (e) {
    console.error("Error loading favorites:", e);
    return [];
  }
};

const saveFavoritesToLocalStorage = (favorites) => {
  try {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  } catch (e) {
    console.error("Error saving favorites:", e);
  }
};

const initialState = {
  items: loadFavoritesFromLocalStorage(),
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addFavorite: (state, action) => {
      const item = action.payload;
      // Check if item already exists to prevent duplicates
      const exists = state.items.some(existingItem => existingItem.id === item.id);
      if (!exists) {
        state.items.push(item);
        saveFavoritesToLocalStorage(state.items);
      }
    },
    removeFavorite: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      saveFavoritesToLocalStorage(state.items);
    },
    updateNote: (state, action) => {
      const { id, note } = action.payload;
      const fav = state.items.find(item => item.id === id);
      if (fav) {
        fav.note = note;
        saveFavoritesToLocalStorage(state.items);
      }
    },
  },
});

export const { addFavorite, removeFavorite, updateNote } = favoritesSlice.actions;
export default favoritesSlice.reducer;
