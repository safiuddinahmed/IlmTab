import React, { createContext, useContext } from "react";
import { useIndexedDB } from "../hooks/useIndexedDB";

const IndexedDBContext = createContext(null);

export const IndexedDBProvider = ({ children }) => {
  const indexedDBState = useIndexedDB();

  return (
    <IndexedDBContext.Provider value={indexedDBState}>
      {children}
    </IndexedDBContext.Provider>
  );
};

export const useIndexedDBContext = () => {
  const context = useContext(IndexedDBContext);
  if (!context) {
    throw new Error(
      "useIndexedDBContext must be used within an IndexedDBProvider"
    );
  }
  return context;
};
