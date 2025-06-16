import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./redux/favoritesSlice";
import settingsReducer from "./redux/settingsSlice";

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    settings: settingsReducer,
  },
});

export default store;
