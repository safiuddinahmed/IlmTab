import Dexie, { Table } from 'dexie';

// Database interfaces - matching Redux structure exactly
export interface IlmTabSettings {
  id: string;
  version: string;
  ayah: {
    tafsirLanguage: string;
    tafsirId: string;
    textEdition: {
      language: string;
      identifier: string;
    };
    audioEdition: {
      identifier: string;
      englishName: string;
    };
  };
  search: {
    translationEdition: string;
  };
  weather: {
    enabled: boolean;
    location: {
      name: string;
      country: string;
      admin1: string;
      latitude: number;
      longitude: number;
    };
    customName: string;
    timeFormat: string;
    temperatureUnit: string;
  };
  hadith: {
    book: string;
    translationLanguage: string;
  };
  greetings: {
    enabled: boolean;
    name: string;
  };
  tasks: {
    enabled: boolean;
  };
  background: {
    refreshInterval: string;
    lastRefreshTime: number | null;
    currentImageUrl: string | null;
    fallbackImageUrl: string;
    imageSource: string;
    islamicCategory: string;
    uploadedImages: Array<{
      id: number;
      url: string;
      name: string;
    }>;
    currentUploadedImageIndex: number;
    blurIntensity: number;
    opacity: number;
    imageCache: {
      images: Array<{
        id: string;
        url: string;
        authorName: string;
        authorLink: string;
        fetchedAt: number;
      }>;
      currentIndex: number;
      lastFetchTime: number;
      category: string;
    };
  };
}

export interface IlmTabFavorite {
  id: string;
  type: 'ayah' | 'hadith';
  surahNumber?: number;
  ayahNumber?: number;
  surahName?: string;
  surahArabicName?: string;
  text?: string;
  englishText?: string;
  audio?: string;
  book?: string;
  bookDisplayName?: string;
  hadithNumber?: number;
  note: string;
  dateAdded?: number;
  tags?: string[];
}

export interface IlmTabTask {
  id: number;
  text: string;
  done: boolean;
}

export interface CachedContent {
  id: string;
  type: 'ayah' | 'hadith';
  content: any;
  dateAdded: number;
  expiresAt: number;
}

export interface CachedImage {
  id: string;
  originalUrl: string;
  optimizedUrl: string;
  dateAdded: number;
  expiresAt: number;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

// Database versioning and migration interface
export interface DatabaseVersion {
  version: number;
  description: string;
  dateAdded: string;
  changes: string[];
}

// Database class with proper versioning
export class IlmTabDatabase extends Dexie {
  settings!: Table<IlmTabSettings>;
  favorites!: Table<IlmTabFavorite>;
  tasks!: Table<IlmTabTask>;
  cachedContent!: Table<CachedContent>;
  cachedImages!: Table<CachedImage>;

  constructor() {
    super('IlmTabDatabase');
    
    // Version 1: Initial schema (December 2024)
    this.version(1).stores({
      settings: 'id',
      favorites: 'id, type, surahNumber, ayahNumber, book, hadithNumber, dateAdded, *tags',
      tasks: 'id, done',
      cachedContent: 'id, type, dateAdded, expiresAt',
      cachedImages: 'id, originalUrl, dateAdded, expiresAt'
    });

    // Version 2: Enhanced image upload support (June 2025)
    this.version(2).stores({
      settings: 'id',
      favorites: 'id, type, surahNumber, ayahNumber, book, hadithNumber, dateAdded, *tags',
      tasks: 'id, done',
      cachedContent: 'id, type, dateAdded, expiresAt',
      cachedImages: 'id, originalUrl, dateAdded, expiresAt'
    }).upgrade(tx => {
      // Migration for enhanced image upload features
      return tx.table('settings').toCollection().modify(settings => {
        if (settings.background && settings.background.uploadedImages) {
          // Update existing uploaded images to include new metadata
          settings.background.uploadedImages = settings.background.uploadedImages.map((img: any) => ({
            ...img,
            uploadedAt: img.dateAdded ? new Date(img.dateAdded).toISOString() : new Date().toISOString(),
            originalSize: img.originalSize || 0,
            compressedSize: img.compressedSize || 0,
            dimensions: img.dimensions || { width: 0, height: 0 },
            compressionRatio: img.compressionRatio || '1.0'
          }));
        }
      });
    });

    // Future versions can be added here:
    // this.version(4).stores({...}).upgrade(tx => {...});
  }
}

// Create database instance
export const db = new IlmTabDatabase();

// Default settings - matching Redux structure exactly
export const defaultSettings: IlmTabSettings = {
  id: 'main',
  version: "1.3.0",
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
  search: {
    translationEdition: "en.sahih",
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
    timeFormat: "12h",
    temperatureUnit: "celsius",
  },
  hadith: {
    book: "sahih-bukhari",
    translationLanguage: "en",
  },
  greetings: {
    enabled: true,
    name: "User"
  },
  tasks: {
    enabled: true
  },
  background: {
    refreshInterval: "newtab",
    lastRefreshTime: null,
    currentImageUrl: null,
    fallbackImageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
    imageSource: "category",
    islamicCategory: "nature",
    uploadedImages: [],
    currentUploadedImageIndex: 0,
    blurIntensity: 0,
    opacity: 100,
    imageCache: {
      images: [],
      currentIndex: 0,
      lastFetchTime: 0,
      category: ""
    }
  }
};
