import { useState, useEffect, useCallback } from 'react';
import { db, defaultSettings, IlmTabSettings, IlmTabFavorite, IlmTabTask } from '../db/schema';
import { DatabaseMigration } from '../db/migration';

/**
 * Hook for managing IndexedDB settings
 */
export const useIndexedDBSettings = () => {
  const [settings, setSettings] = useState<IlmTabSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // Check if migration is needed and run it
        const needsMigration = await DatabaseMigration.needsMigration();
        if (needsMigration) {
          console.log('🔄 Running database migrations...');
          await DatabaseMigration.runMigrations();
        }
        
        // Load settings directly from database
        const currentSettings = await db.settings.get('main');
        
        // If no settings exist, initialize with defaults
        if (!currentSettings) {
          await db.settings.put({ ...defaultSettings, id: 'main' });
          setSettings(defaultSettings);
        } else {
          setSettings(currentSettings);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update settings with optimistic update
  const updateSettings = useCallback(async (updates: Partial<IlmTabSettings>) => {
    try {
      // Optimistic update - merge with current settings immediately
      setSettings(prev => prev ? { ...prev, ...updates } : null);
      
      // Then persist to IndexedDB
      const existing = await db.settings.get('main');
      const newSettings = existing ? { ...existing, ...updates } : { ...defaultSettings, ...updates, id: 'main' };
      await db.settings.put(newSettings);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError('Failed to update settings');
      // Revert optimistic update on error
      const currentSettings = await db.settings.get('main');
      setSettings(currentSettings || null);
    }
  }, []);

  // Update specific setting path (like Redux)
  const updateSettingPath = useCallback(async (path: string, value: any) => {
    if (!settings) return;

    const pathParts = path.split('.');
    const updates = { ...settings };
    
    let current: any = updates;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;

    await updateSettings(updates);
  }, [settings, updateSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    updateSettingPath
  };
};

/**
 * Hook for managing favorites
 */
export const useIndexedDBFavorites = () => {
  const [favorites, setFavorites] = useState<IlmTabFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load favorites
  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const currentFavorites = await db.favorites.toArray();
      setFavorites(currentFavorites);
      setError(null);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Add favorite with optimistic update
  const addFavorite = useCallback(async (favorite: Omit<IlmTabFavorite, 'dateAdded'>) => {
    try {
      // Optimistic update - add to state immediately
      const newFavorite: IlmTabFavorite = { ...favorite, dateAdded: Date.now() };
      setFavorites(prev => [...prev, newFavorite]);
      
      // Then persist to IndexedDB
      await db.favorites.put(newFavorite);
    } catch (err) {
      console.error('Failed to add favorite:', err);
      setError('Failed to add favorite');
      // Revert optimistic update on error
      await loadFavorites();
    }
  }, [loadFavorites]);

  // Remove favorite with optimistic update
  const removeFavorite = useCallback(async (id: string) => {
    try {
      // Optimistic update - remove from state immediately
      setFavorites(prev => prev.filter(fav => fav.id !== id));
      
      // Then persist to IndexedDB
      await db.favorites.delete(id);
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      setError('Failed to remove favorite');
      // Revert optimistic update on error
      await loadFavorites();
    }
  }, [loadFavorites]);

  // Update favorite note
  const updateFavoriteNote = useCallback(async (id: string, note: string) => {
    try {
      await db.favorites.update(id, { note });
      await loadFavorites(); // Refresh list
    } catch (err) {
      console.error('Failed to update favorite note:', err);
      setError('Failed to update favorite note');
    }
  }, [loadFavorites]);

  // Search favorites
  const searchFavorites = useCallback(async (query: string) => {
    try {
      const lowerQuery = query.toLowerCase();
      const results = await db.favorites
  .filter(fav => 
    (fav.text?.toLowerCase().includes(lowerQuery) ?? false) ||
    (fav.englishText?.toLowerCase().includes(lowerQuery) ?? false) ||
    (fav.note?.toLowerCase().includes(lowerQuery) ?? false) ||
    (fav.surahName?.toLowerCase().includes(lowerQuery) ?? false)
  )
  .toArray();

      return results;
    } catch (err) {
      console.error('Failed to search favorites:', err);
      return [];
    }
  }, []);

  // Check if item is favorited
  const isFavorited = useCallback((id: string) => {
    return favorites.some(fav => fav.id === id);
  }, [favorites]);

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    updateFavoriteNote,
    searchFavorites,
    isFavorited,
    refresh: loadFavorites
  };
};

/**
 * Hook for managing tasks
 */
export const useIndexedDBTasks = () => {
  const [tasks, setTasks] = useState<IlmTabTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const currentTasks = await db.tasks.toArray();
      setTasks(currentTasks);
      setError(null);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Add task with optimistic update
  const addTask = useCallback(async (task: { text: string; done?: boolean }) => {
    try {
      // Create task object - Dexie will auto-generate the id
      const taskData: Omit<IlmTabTask, 'id'> = {
        text: task.text,
        done: task.done ?? false
      };
      
      // Add to IndexedDB (id will be auto-generated)
      const id = await db.tasks.add(taskData as any);
      
      // Update state with real data
      await loadTasks();
    } catch (err) {
      console.error('Failed to add task:', err);
      setError('Failed to add task');
    }
  }, [loadTasks]);

  // Update task with optimistic update
  const updateTask = useCallback(async (id: number, updates: Partial<IlmTabTask>) => {
    try {
      // Optimistic update - update in state immediately
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));
      
      // Then persist to IndexedDB
      await db.tasks.update(id, updates);
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task');
      // Revert optimistic update on error
      await loadTasks();
    }
  }, [loadTasks]);

  // Delete task with optimistic update
  const deleteTask = useCallback(async (id: number) => {
    try {
      // Optimistic update - remove from state immediately
      setTasks(prev => prev.filter(task => task.id !== id));
      
      // Then persist to IndexedDB
      await db.tasks.delete(id);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task');
      // Revert optimistic update on error
      await loadTasks();
    }
  }, [loadTasks]);

  // Toggle task completion
  const toggleTask = useCallback(async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { done: !task.done });
    }
  }, [tasks, updateTask]);

  // Get task statistics
  const getTaskStats = useCallback(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    const pending = total - completed;
    
    return { total, completed, pending };
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getTaskStats,
    refresh: loadTasks
  };
};

/**
 * Combined hook for all IndexedDB functionality
 */
export const useIndexedDB = () => {
  const settingsHook = useIndexedDBSettings();
  const favoritesHook = useIndexedDBFavorites();
  const tasksHook = useIndexedDBTasks();

  const isReady = settingsHook.settings !== null && !settingsHook.loading;

  // Structure the return to match what App.jsx expects
  return {
    settings: {
      settings: settingsHook.settings,
      loading: settingsHook.loading,
      error: settingsHook.error,
      updateSettings: settingsHook.updateSettings,
      updateSettingPath: settingsHook.updateSettingPath
    },
    favorites: {
      favorites: favoritesHook.favorites,
      loading: favoritesHook.loading,
      error: favoritesHook.error,
      addFavorite: favoritesHook.addFavorite,
      removeFavorite: favoritesHook.removeFavorite,
      updateFavoriteNote: favoritesHook.updateFavoriteNote,
      searchFavorites: favoritesHook.searchFavorites,
      isFavorited: favoritesHook.isFavorited,
      refresh: favoritesHook.refresh
    },
    tasks: {
      tasks: tasksHook.tasks,
      loading: tasksHook.loading,
      error: tasksHook.error,
      addTask: tasksHook.addTask,
      updateTask: tasksHook.updateTask,
      deleteTask: tasksHook.deleteTask,
      toggleTask: tasksHook.toggleTask,
      getTaskStats: tasksHook.getTaskStats,
      refresh: tasksHook.refresh
    },
    isReady
  };
};
