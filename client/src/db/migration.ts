import { db, IlmTabSettings, defaultSettings } from './schema';
import { Transaction } from 'dexie';

// Migration utilities and helpers
export class DatabaseMigration {
  
  /**
   * Check if database needs migration
   */
  static async needsMigration(): Promise<boolean> {
    try {
      const settings = await db.settings.get('main');
      if (!settings) return true;
      
      // Check version compatibility
      const currentVersion = settings.version;
      const targetVersion = defaultSettings.version;
      
      return this.compareVersions(currentVersion, targetVersion) < 0;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return true;
    }
  }

  /**
   * Compare version strings (semantic versioning)
   */
  static compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }
    
    return 0;
  }

  /**
   * Run all necessary migrations
   */
  static async runMigrations(): Promise<void> {
    console.log('🔄 Starting database migrations...');
    
    try {
      await db.transaction('rw', [db.settings, db.favorites, db.tasks, db.cachedContent, db.cachedImages], async (tx) => {
        await this.migrateSettings(tx);
        await this.migrateFavorites(tx);
        await this.migrateTasks(tx);
        await this.cleanupExpiredCache(tx);
        await this.optimizeDatabase(tx);
      });
      
      console.log('✅ Database migrations completed successfully');
    } catch (error) {
      console.error('❌ Database migration failed:', error);
      throw error;
    }
  }

  /**
   * Migrate settings to latest schema
   */
  static async migrateSettings(tx: Transaction): Promise<void> {
    console.log('🔧 Migrating settings...');
    
    const existingSettings = await tx.table('settings').get('main');
    
    if (!existingSettings) {
      // First time setup - create default settings
      await tx.table('settings').put(defaultSettings);
      console.log('📝 Created default settings');
      return;
    }

    // Deep merge existing settings with defaults to add missing properties
    const migratedSettings = this.deepMergeSettings(existingSettings, defaultSettings);
    
    // Update version
    migratedSettings.version = defaultSettings.version;
    
    // Specific migrations based on version
    await this.applyVersionSpecificMigrations(migratedSettings, existingSettings.version);
    
    await tx.table('settings').put(migratedSettings);
    console.log(`📝 Settings migrated from v${existingSettings.version} to v${migratedSettings.version}`);
  }

  /**
   * Apply version-specific migrations
   */
  static async applyVersionSpecificMigrations(settings: IlmTabSettings, fromVersion: string): Promise<void> {
    // Migration from v1.2.x to v1.3.x
    if (this.compareVersions(fromVersion, '1.3.0') < 0) {
      console.log('🔄 Applying v1.3.0 migrations...');
      
      // Ensure background settings have new properties
      if (!settings.background.blurIntensity) {
        settings.background.blurIntensity = 0;
      }
      if (!settings.background.opacity) {
        settings.background.opacity = 100;
      }
      
      // Migrate uploaded images to new format
      if (settings.background.uploadedImages) {
        settings.background.uploadedImages = settings.background.uploadedImages.map((img: any) => ({
          id: img.id || Date.now() + Math.random(),
          url: img.url,
          name: img.name || 'Uploaded Image',
          uploadedAt: img.uploadedAt || new Date().toISOString(),
          originalSize: img.originalSize || 0,
          compressedSize: img.compressedSize || 0,
          dimensions: img.dimensions || { width: 0, height: 0 },
          compressionRatio: img.compressionRatio || '1.0'
        }));
      }
      
      // Ensure greetings and tasks are enabled by default
      if (settings.greetings.enabled === undefined) {
        settings.greetings.enabled = true;
      }
      if (settings.tasks.enabled === undefined) {
        settings.tasks.enabled = true;
      }
    }

    // Future version migrations can be added here
    // if (this.compareVersions(fromVersion, '1.4.0') < 0) { ... }
  }

  /**
   * Deep merge settings objects
   */
  static deepMergeSettings(existing: any, defaults: any): IlmTabSettings {
    const result = { ...existing };
    
    for (const key in defaults) {
      if (defaults.hasOwnProperty(key)) {
        if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) {
          result[key] = this.deepMergeSettings(existing[key] || {}, defaults[key]);
        } else if (existing[key] === undefined) {
          result[key] = defaults[key];
        }
      }
    }
    
    return result as IlmTabSettings;
  }

  /**
   * Migrate favorites to latest schema
   */
  static async migrateFavorites(tx: Transaction): Promise<void> {
    console.log('🔧 Migrating favorites...');
    
    const favorites = await tx.table('favorites').toArray();
    let migratedCount = 0;
    
    for (const favorite of favorites) {
      let needsUpdate = false;
      const updated = { ...favorite };
      
      // Ensure dateAdded exists
      if (!updated.dateAdded) {
        updated.dateAdded = Date.now();
        needsUpdate = true;
      }
      
      // Ensure tags array exists
      if (!updated.tags) {
        updated.tags = [];
        needsUpdate = true;
      }
      
      // Migrate old hadith book names to new format
      if (updated.type === 'hadith' && updated.book) {
        const bookMigrations: Record<string, string> = {
          'bukhari': 'sahih-bukhari',
          'muslim': 'sahih-muslim',
          'tirmidhi': 'jami-at-tirmidhi',
          'abudawud': 'sunan-abu-dawud',
          'nasai': 'sunan-an-nasai',
          'ibnmajah': 'sunan-ibn-majah'
        };
        
        if (bookMigrations[updated.book]) {
          updated.book = bookMigrations[updated.book];
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await tx.table('favorites').put(updated);
        migratedCount++;
      }
    }
    
    if (migratedCount > 0) {
      console.log(`📝 Migrated ${migratedCount} favorites`);
    }
  }

  /**
   * Migrate tasks to latest schema
   */
  static async migrateTasks(tx: Transaction): Promise<void> {
    console.log('🔧 Migrating tasks...');
    
    const tasks = await tx.table('tasks').toArray();
    let migratedCount = 0;
    
    for (const task of tasks) {
      let needsUpdate = false;
      const updated = { ...task };
      
      // Ensure id is a number
      if (typeof updated.id !== 'number') {
        updated.id = parseInt(updated.id as string) || Date.now();
        needsUpdate = true;
      }
      
      // Ensure done is a boolean
      if (typeof updated.done !== 'boolean') {
        updated.done = updated.done ? true : false;
        needsUpdate = true;
      }
      
      // Ensure text is a string
      if (typeof updated.text !== 'string') {
        updated.text = String(updated.text || '');
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await tx.table('tasks').put(updated);
        migratedCount++;
      }
    }
    
    if (migratedCount > 0) {
      console.log(`📝 Migrated ${migratedCount} tasks`);
    }
  }

  /**
   * Clean up expired cache entries
   */
  static async cleanupExpiredCache(tx: Transaction): Promise<void> {
    console.log('🧹 Cleaning up expired cache...');
    
    const now = Date.now();
    
    // Clean expired content cache
    const expiredContent = await tx.table('cachedContent')
      .where('expiresAt')
      .below(now)
      .toArray();
    
    if (expiredContent.length > 0) {
      await tx.table('cachedContent')
        .where('expiresAt')
        .below(now)
        .delete();
      console.log(`🗑️ Removed ${expiredContent.length} expired content cache entries`);
    }
    
    // Clean expired image cache
    const expiredImages = await tx.table('cachedImages')
      .where('expiresAt')
      .below(now)
      .toArray();
    
    if (expiredImages.length > 0) {
      await tx.table('cachedImages')
        .where('expiresAt')
        .below(now)
        .delete();
      console.log(`🗑️ Removed ${expiredImages.length} expired image cache entries`);
    }
  }

  /**
   * Optimize database performance
   */
  static async optimizeDatabase(tx: Transaction): Promise<void> {
    console.log('⚡ Optimizing database...');
    
    // Remove duplicate favorites (by id)
    const favorites = await tx.table('favorites').toArray();
    const uniqueFavorites = new Map();
    let duplicatesRemoved = 0;
    
    for (const favorite of favorites) {
      if (uniqueFavorites.has(favorite.id)) {
        await tx.table('favorites').delete(favorite.id);
        duplicatesRemoved++;
      } else {
        uniqueFavorites.set(favorite.id, favorite);
      }
    }
    
    if (duplicatesRemoved > 0) {
      console.log(`🗑️ Removed ${duplicatesRemoved} duplicate favorites`);
    }
    
    // Limit cache size (keep only 100 most recent entries)
    const contentCache = await tx.table('cachedContent')
      .orderBy('dateAdded')
      .reverse()
      .toArray();
    
    if (contentCache.length > 100) {
      const toDelete = contentCache.slice(100);
      for (const item of toDelete) {
        await tx.table('cachedContent').delete(item.id);
      }
      console.log(`🗑️ Trimmed content cache to 100 entries (removed ${toDelete.length})`);
    }
    
    // Limit image cache size (keep only 50 most recent entries)
    const imageCache = await tx.table('cachedImages')
      .orderBy('dateAdded')
      .reverse()
      .toArray();
    
    if (imageCache.length > 50) {
      const toDelete = imageCache.slice(50);
      for (const item of toDelete) {
        await tx.table('cachedImages').delete(item.id);
      }
      console.log(`🗑️ Trimmed image cache to 50 entries (removed ${toDelete.length})`);
    }
  }

  /**
   * Export database for backup
   */
  static async exportDatabase(): Promise<string> {
    console.log('📦 Exporting database...');
    
    const data = {
      version: defaultSettings.version,
      exportDate: new Date().toISOString(),
      settings: await db.settings.toArray(),
      favorites: await db.favorites.toArray(),
      tasks: await db.tasks.toArray(),
      // Don't export cache as it's temporary
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import database from backup
   */
  static async importDatabase(jsonData: string): Promise<void> {
    console.log('📥 Importing database...');
    
    try {
      const data = JSON.parse(jsonData);
      
      await db.transaction('rw', [db.settings, db.favorites, db.tasks], async (tx) => {
        // Clear existing data
        await tx.table('settings').clear();
        await tx.table('favorites').clear();
        await tx.table('tasks').clear();
        
        // Import data
        if (data.settings) {
          await tx.table('settings').bulkAdd(data.settings);
        }
        if (data.favorites) {
          await tx.table('favorites').bulkAdd(data.favorites);
        }
        if (data.tasks) {
          await tx.table('tasks').bulkAdd(data.tasks);
        }
      });
      
      // Run migrations on imported data
      await this.runMigrations();
      
      console.log('✅ Database imported successfully');
    } catch (error) {
      console.error('❌ Database import failed:', error);
      throw error;
    }
  }

  /**
   * Reset database to defaults
   */
  static async resetDatabase(): Promise<void> {
    console.log('🔄 Resetting database to defaults...');
    
    await db.transaction('rw', [db.settings, db.favorites, db.tasks, db.cachedContent, db.cachedImages], async (tx) => {
      await tx.table('settings').clear();
      await tx.table('favorites').clear();
      await tx.table('tasks').clear();
      await tx.table('cachedContent').clear();
      await tx.table('cachedImages').clear();
      
      await tx.table('settings').put(defaultSettings);
    });
    
    console.log('✅ Database reset completed');
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats(): Promise<{
    settings: number;
    favorites: number;
    tasks: number;
    cachedContent: number;
    cachedImages: number;
    totalSize: string;
  }> {
    const stats = {
      settings: await db.settings.count(),
      favorites: await db.favorites.count(),
      tasks: await db.tasks.count(),
      cachedContent: await db.cachedContent.count(),
      cachedImages: await db.cachedImages.count(),
      totalSize: 'Unknown'
    };

    // Estimate database size (rough calculation)
    try {
      if ('estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage) {
          stats.totalSize = this.formatBytes(estimate.usage);
        }
      }
    } catch (error) {
      console.warn('Could not estimate storage usage:', error);
    }

    return stats;
  }

  /**
   * Format bytes to human readable string
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export migration utilities for use in IndexedDB context
export default DatabaseMigration;
