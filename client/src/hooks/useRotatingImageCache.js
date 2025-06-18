import { useState, useEffect, useRef } from 'react';
import { useIndexedDBContext } from '../contexts/IndexedDBContext';
import { buildOptimizedImageUrl, buildPlaceholderUrl } from '../utils/imageOptimization';
import axios from 'axios';

const ACCESS_KEY = "CmH0hk3YgDGkNbMvPBhbNL8n23lQwrNnrneWYr-lVlc";

/**
 * Rotating image cache hook inspired by Tabliss
 * Fetches 5 images on load, rotates through them, and prefetches when needed
 */
export const useRotatingImageCache = () => {
  const { settings } = useIndexedDBContext();
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placeholderUrl, setPlaceholderUrl] = useState(null);
  const fetchingRef = useRef(false);
  const preloadRef = useRef(null);

  // Get current settings
  const currentSettings = settings?.settings || {};
  const backgroundSettings = currentSettings.background || {};
  const imageSource = backgroundSettings.imageSource || 'category';
  const islamicCategory = backgroundSettings.islamicCategory || 'nature';
  const imageCache = backgroundSettings.imageCache || {
    images: [],
    currentIndex: 0,
    lastFetchTime: 0,
    category: ''
  };


  // Fetch images from Unsplash API or use single static image in development
  const fetchImages = async (category) => {
    console.log('🔄 Fetching images for category:', category);
    
    // In development, use single optimized static image to avoid API usage
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Using single static image');
      const devImageRaw = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";
      
      return [{
        id: 'dev-static',
        url: devImageRaw,
        authorName: 'Annie Spratt',
        authorLink: 'https://unsplash.com/@anniespratt?utm_source=ilmtab&utm_medium=referral',
        fetchedAt: Date.now()
      }];
    }
    
    try {
      // Islamic category queries for appropriate content
      const categoryQueries = {
        nature: "nature,landscape,mountains,sky,peaceful",
        architecture: "mosque,islamic architecture,minaret,dome",
        calligraphy: "arabic calligraphy,islamic art",
        geometric: "islamic pattern,islamic geometric,mandala,islamic symmetry",
      };

      const query = categoryQueries[category] || categoryQueries.nature;

      const response = await axios.get(
        "https://api.unsplash.com/photos/random",
        {
          params: {
            query: query,
            orientation: "landscape",
            count: 5, // Fetch 5 images at once
          },
          headers: {
            Authorization: `Client-ID ${ACCESS_KEY}`,
          },
          timeout: 10000,
        }
      );

      if (response.data && Array.isArray(response.data)) {
        const images = response.data.map((data) => ({
          id: data.id,
          url: data.urls.raw,
          authorName: data.user.name,
          authorLink: `${data.user.links.html}?utm_source=ilmtab&utm_medium=referral`,
          fetchedAt: Date.now(),
          downloadLocation: data.links.download_location, // For tracking
        }));

        console.log('✅ Fetched', images.length, 'images from Unsplash API');

        // Track downloads for Unsplash API compliance
        images.forEach(async (image) => {
          if (image.downloadLocation) {
            try {
              await axios.get(image.downloadLocation, {
                headers: {
                  Authorization: `Client-ID ${ACCESS_KEY}`,
                },
                timeout: 5000,
              });
              console.log('✅ Download tracked for image:', image.id);
            } catch (err) {
              console.error('❌ Failed to track download for image:', image.id);
            }
          }
        });

        return images;
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.error('❌ Failed to fetch from Unsplash API:', error);
      
      // Fallback to single optimized image
      return [{
        id: 'fallback',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        authorName: 'Annie Spratt',
        authorLink: 'https://unsplash.com/@anniespratt?utm_source=ilmtab&utm_medium=referral',
        fetchedAt: Date.now()
      }];
    }
  };

  // Track if this is the first load to prevent unnecessary rotations
  const hasInitialized = useRef(false);

  // Initialize or rotate cache
  const initializeCache = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);

    try {
      const needsNewCache = 
        imageCache.images.length === 0 || // No cache
        imageCache.category !== islamicCategory; // Category changed

      if (needsNewCache) {
        console.log('🔄 Initializing new cache for category:', islamicCategory);
        
        // Fetch fresh images
        const newImages = await fetchImages(islamicCategory);
        
        // Update cache in settings
        const newCache = {
          images: newImages,
          currentIndex: 0,
          lastFetchTime: Date.now(),
          category: islamicCategory
        };

        settings?.updateSettings({
          background: {
            ...backgroundSettings,
            imageCache: newCache,
            currentImageUrl: buildOptimizedImageUrl(newImages[0]?.url),
            lastRefreshTime: Date.now()
          }
        });

        setCurrentImage(newImages[0]);
        hasInitialized.current = true;
      } else if (!hasInitialized.current) {
        // First load with existing cache - rotate to next image
        const currentIndex = imageCache.currentIndex;
        const nextIndex = (currentIndex + 1) % imageCache.images.length;
        
        console.log('🔄 Rotating cache from index', currentIndex, 'to', nextIndex);
        
        // Check if we need to prefetch more images (when reaching 4th image)
        const shouldPrefetch = nextIndex === 3 && imageCache.images.length === 5;
        
        if (shouldPrefetch) {
          console.log('� Prefetching more images...');
          const newImages = await fetchImages(islamicCategory);
          
          // Replace cache with new images, keep current image visible
          const updatedCache = {
            images: newImages,
            currentIndex: 0, // Reset to first of new batch
            lastFetchTime: Date.now(),
            category: islamicCategory
          };

          settings?.updateSettings({
            background: {
              ...backgroundSettings,
              imageCache: updatedCache,
              currentImageUrl: buildOptimizedImageUrl(newImages[0]?.url),
              lastRefreshTime: Date.now()
            }
          });

          setCurrentImage(newImages[0]);
        } else {
          // Just rotate to next image
          const nextImage = imageCache.images[nextIndex];
          
          settings?.updateSettings({
            background: {
              ...backgroundSettings,
              imageCache: {
                ...imageCache,
                currentIndex: nextIndex
              },
              currentImageUrl: buildOptimizedImageUrl(nextImage?.url),
              lastRefreshTime: Date.now()
            }
          });

          setCurrentImage(nextImage);
        }
        hasInitialized.current = true;
      } else {
        // Already initialized, just use current cached image
        const cachedImage = imageCache.images[imageCache.currentIndex];
        setCurrentImage(cachedImage);
      }
    } catch (error) {
      console.error('❌ Failed to initialize cache:', error);
      
      // Fallback to single image
      const fallbackImage = {
        id: 'fallback',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        authorName: 'Fallback Image',
        authorLink: '#',
        fetchedAt: Date.now()
      };
      
      setCurrentImage(fallbackImage);
      
      settings?.updateSettings({
        background: {
          ...backgroundSettings,
          currentImageUrl: buildOptimizedImageUrl(fallbackImage.url),
          lastRefreshTime: Date.now(),
          isUsingFallback: true
        }
      });
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  // Progressive loading with blur placeholder
  useEffect(() => {
    if (currentImage?.url) {
      // Show blur placeholder immediately
      const placeholder = buildPlaceholderUrl(currentImage.url);
      if (placeholder) {
        setPlaceholderUrl(placeholder);
        console.log('🖼️ Showing blur placeholder for instant feedback');
      }
    }
  }, [currentImage]);

  // Preload next image (Tabliss-style optimization)
  useEffect(() => {
    if (imageCache.images.length > 0) {
      const nextIndex = (imageCache.currentIndex + 1) % imageCache.images.length;
      const nextImage = imageCache.images[nextIndex];
      
      if (nextImage && nextImage.url) {
        // Cancel previous preload
        if (preloadRef.current) {
          preloadRef.current.onload = null;
          preloadRef.current.onerror = null;
        }
        
        // Preload next image
        preloadRef.current = new Image();
        const optimizedUrl = buildOptimizedImageUrl(nextImage.url);
        
        preloadRef.current.onload = () => {
          console.log('✅ Preloaded next image:', nextImage.id);
        };
        
        preloadRef.current.onerror = () => {
          console.log('❌ Failed to preload next image:', nextImage.id);
        };
        
        preloadRef.current.src = optimizedUrl;
        console.log('🔄 Preloading next image:', nextImage.id);
      }
    }
  }, [imageCache.currentIndex, imageCache.images]);

  // Initialize cache when component mounts or category changes
  useEffect(() => {
    if (settings?.settings && imageSource === 'category') {
      initializeCache();
    }
  }, [islamicCategory, imageSource, settings?.settings]);

  return {
    currentImage,
    loading,
    placeholderUrl,
    cacheInfo: {
      totalImages: imageCache.images.length,
      currentIndex: imageCache.currentIndex,
      category: imageCache.category,
      lastFetchTime: imageCache.lastFetchTime
    }
  };
};
