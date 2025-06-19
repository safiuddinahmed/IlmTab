import { useState, useEffect, useRef } from 'react';
import { useIndexedDBContext } from '../contexts/IndexedDBContext';
import { buildOptimizedImageUrl, buildPlaceholderUrl } from '../utils/imageOptimization';
import axios from 'axios';

const ACCESS_KEY = "CmH0hk3YgDGkNbMvPBhbNL8n23lQwrNnrneWYr-lVlc";

/**
 * Rotating image cache hook with proper fallback handling
 * Requirements:
 * 1. Upload images rotate based on interval
 * 2. When uploads removed, auto-switch to Unsplash or fallback
 * 3. Show fallback status when using fallback image
 * 4. Keep fallback status when switching to empty upload mode
 */
export const useRotatingImageCache = () => {
  const { settings } = useIndexedDBContext();
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placeholderUrl, setPlaceholderUrl] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const fetchingRef = useRef(false);
  const preloadRef = useRef(null);
  const initializedRef = useRef(false);

  // Get current settings
  const currentSettings = settings?.settings || {};
  const backgroundSettings = currentSettings.background || {};
  const imageSource = backgroundSettings.imageSource || 'category';
  const islamicCategory = backgroundSettings.islamicCategory || 'nature';
  const refreshInterval = backgroundSettings.refreshInterval || 'newtab';
  const lastRefreshTime = backgroundSettings.lastRefreshTime || 0;
  const imageCache = backgroundSettings.imageCache || {
    images: [],
    currentIndex: 0,
    lastFetchTime: 0,
    category: ''
  };
  const uploadedImages = backgroundSettings.uploadedImages || [];
  const currentUploadedImageIndex = backgroundSettings.currentUploadedImageIndex || 0;

  // Fallback image definition - use local mosque image
  const FALLBACK_IMAGE = {
    id: 'fallback',
    url: '/mosque.jpg', // Use local mosque image from extension
    authorName: 'IlmTab',
    authorLink: '#',
    fetchedAt: Date.now()
  };

  // Helper function to check if enough time has passed based on refresh interval
  const shouldRefreshBasedOnTime = () => {
    if (refreshInterval === "newtab") {
      return true; // Always rotate on new tab
    }
    
    const now = Date.now();
    const timeDiff = now - lastRefreshTime;
    
    switch (refreshInterval) {
      case "hourly": return timeDiff > 60 * 60 * 1000; // 1 hour
      case "daily": return timeDiff > 24 * 60 * 60 * 1000; // 24 hours
      case "weekly": return timeDiff > 7 * 24 * 60 * 60 * 1000; // 7 days
      default: return true;
    }
  };

  // Update settings helper
  const updateBackgroundSettings = (updates) => {
    settings?.updateSettings({
      background: {
        ...backgroundSettings,
        ...updates
      }
    });
  };

  // Set fallback image
  const setFallbackImage = () => {
    console.log('🔄 Using fallback image');
    setCurrentImage(FALLBACK_IMAGE);
    setIsUsingFallback(true);
    updateBackgroundSettings({
      isUsingFallback: true,
      currentImageUrl: buildOptimizedImageUrl(FALLBACK_IMAGE.url),
      lastRefreshTime: Date.now()
    });
  };

  // Fetch images from Unsplash API
  const fetchImages = async (category) => {
    console.log('🔄 Fetching images for category:', category);
    
    // In development, use fallback image
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Using fallback image');
      return [FALLBACK_IMAGE];
    }
    
    try {
      // Islamic category queries for appropriate content
      const categoryQueries = {
        nature: "nature,landscape,mountains,sky,peaceful",
        architecture: "mosque,islamic architecture,minaret,dome",
        calligraphy: "quran, arabic calligraphy,",
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
          downloadLocation: data.links.download_location,
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
      return [FALLBACK_IMAGE];
    }
  };

  // Handle Unsplash image rotation
  const handleUnsplashImages = async () => {
    try {
      const needsNewCache = 
        imageCache.images.length === 0 || 
        imageCache.category !== islamicCategory;

      if (needsNewCache) {
        console.log('🔄 Initializing new cache for category:', islamicCategory);
        
        const newImages = await fetchImages(islamicCategory);
        const isFallback = newImages.length === 1 && newImages[0].id === 'fallback';
        
        const newCache = {
          images: newImages,
          currentIndex: 0,
          lastFetchTime: Date.now(),
          category: islamicCategory
        };

        updateBackgroundSettings({
          imageCache: newCache,
          currentImageUrl: buildOptimizedImageUrl(newImages[0]?.url),
          lastRefreshTime: Date.now(),
          isUsingFallback: isFallback
        });

        setCurrentImage(newImages[0]);
        setIsUsingFallback(isFallback);
      } else {
        // Check if we should rotate based on time
        const shouldRefresh = shouldRefreshBasedOnTime();
        
        if (shouldRefresh) {
          console.log(`🕒 Time-based refresh needed (${refreshInterval}), rotating to next image`);
          
          const currentIndex = imageCache.currentIndex;
          const nextIndex = (currentIndex + 1) % imageCache.images.length;
          const nextImage = imageCache.images[nextIndex];
          
          console.log('🔄 Rotating cache from index', currentIndex, 'to', nextIndex);
          
          // Check if we need to prefetch more images
          const shouldPrefetch = nextIndex >= imageCache.images.length - 2;
          
          if (shouldPrefetch && imageCache.images[0]?.id !== 'fallback') {
            console.log('🔄 Prefetching more images...');
            const newImages = await fetchImages(islamicCategory);
            
            if (newImages[0]?.id !== 'fallback') {
              const keepLastImages = imageCache.images.slice(-3);
              const extendedImages = [...keepLastImages, ...newImages];
              
              const updatedCache = {
                images: extendedImages,
                currentIndex: nextIndex >= imageCache.images.length - 1 ? 3 : nextIndex,
                lastFetchTime: Date.now(),
                category: islamicCategory
              };

              updateBackgroundSettings({
                imageCache: updatedCache,
                currentImageUrl: buildOptimizedImageUrl(extendedImages[updatedCache.currentIndex]?.url),
                lastRefreshTime: Date.now(),
                isUsingFallback: false
              });

              setCurrentImage(extendedImages[updatedCache.currentIndex]);
              setIsUsingFallback(false);
            } else {
              // Fallback case
              setFallbackImage();
            }
          } else {
            // Just rotate to next image
            const isFallback = nextImage?.id === 'fallback';
            
            updateBackgroundSettings({
              imageCache: {
                ...imageCache,
                currentIndex: nextIndex
              },
              currentImageUrl: buildOptimizedImageUrl(nextImage?.url),
              lastRefreshTime: Date.now(),
              isUsingFallback: isFallback
            });

            setCurrentImage(nextImage);
            setIsUsingFallback(isFallback);
          }
        } else {
          console.log(`⏰ Refresh interval not met (${refreshInterval}), using current cached image`);
          const cachedImage = imageCache.images[imageCache.currentIndex];
          const isFallback = cachedImage?.id === 'fallback';
          
          setCurrentImage(cachedImage);
          setIsUsingFallback(isFallback);
        }
      }
    } catch (error) {
      console.error('❌ Failed to handle Unsplash images:', error);
      setFallbackImage();
    }
  };

  // Handle uploaded image rotation
  const handleUploadedImages = () => {
    if (uploadedImages.length === 0) {
      console.log('📁 No uploaded images, using fallback');
      setFallbackImage();
      return;
    }

    const shouldRefresh = shouldRefreshBasedOnTime();
    
    if (shouldRefresh) {
      console.log(`🕒 Time-based refresh needed (${refreshInterval}), rotating uploaded image`);
      
      const nextIndex = (currentUploadedImageIndex + 1) % uploadedImages.length;
      const nextUploadedImage = uploadedImages[nextIndex];
      
      console.log('🔄 Rotating uploaded image from index', currentUploadedImageIndex, 'to', nextIndex);
      
      updateBackgroundSettings({
        currentUploadedImageIndex: nextIndex,
        lastRefreshTime: Date.now(),
        isUsingFallback: false,
        currentImageUrl: buildOptimizedImageUrl(nextUploadedImage.url)
      });

      setCurrentImage({
        id: nextUploadedImage.id,
        url: nextUploadedImage.url,
        authorName: 'Your Upload',
        authorLink: '#',
        fetchedAt: Date.now()
      });
      setIsUsingFallback(false);
    } else {
      console.log(`⏰ Refresh interval not met (${refreshInterval}), using current uploaded image`);
      const currentUploadedImage = uploadedImages[currentUploadedImageIndex];
      
      if (currentUploadedImage) {
        setCurrentImage({
          id: currentUploadedImage.id,
          url: currentUploadedImage.url,
          authorName: 'Your Upload',
          authorLink: '#',
          fetchedAt: Date.now()
        });
        setIsUsingFallback(false);
      } else {
        setFallbackImage();
      }
    }
  };

  // Main initialization function
  const initializeImages = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);

    try {
      if (imageSource === 'upload') {
        handleUploadedImages();
      } else {
        await handleUnsplashImages();
      }
    } catch (error) {
      console.error('❌ Failed to initialize images:', error);
      setFallbackImage();
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  // Progressive loading with blur placeholder
  useEffect(() => {
    if (currentImage?.url) {
      const placeholder = buildPlaceholderUrl(currentImage.url);
      if (placeholder) {
        setPlaceholderUrl(placeholder);
      }
    }
  }, [currentImage]);

  // Preload next image for Unsplash
  useEffect(() => {
    if (imageSource === 'category' && imageCache.images.length > 0 && !isUsingFallback) {
      const nextIndex = (imageCache.currentIndex + 1) % imageCache.images.length;
      const nextImage = imageCache.images[nextIndex];
      
      if (nextImage && nextImage.url) {
        if (preloadRef.current) {
          preloadRef.current.onload = null;
          preloadRef.current.onerror = null;
        }
        
        preloadRef.current = new Image();
        const optimizedUrl = buildOptimizedImageUrl(nextImage.url);
        
        preloadRef.current.onload = () => {
          console.log('✅ Preloaded next image:', nextImage.id);
        };
        
        preloadRef.current.src = optimizedUrl;
      }
    }
  }, [imageCache.currentIndex, imageCache.images, imageSource, isUsingFallback]);

  // Initialize on mount
  useEffect(() => {
    if (settings?.settings && !initializedRef.current) {
      console.log('🚀 First initialization for image source:', imageSource);
      initializedRef.current = true;
      initializeImages();
    }
  }, [settings?.settings]);

  // Handle image source and settings changes
  useEffect(() => {
    if (initializedRef.current) {
      console.log('🔄 Settings changed, reinitializing...');
      initializeImages();
    }
  }, [imageSource, islamicCategory, uploadedImages.length]);

  // Handle uploaded images removal - auto-switch to Unsplash
  // Only switch if we had images before and now they're all deleted
  const previousUploadedImagesLength = useRef(uploadedImages.length);
  
  useEffect(() => {
    // Only auto-switch if:
    // 1. We're in upload mode
    // 2. We previously had images (not a fresh switch to upload mode)
    // 3. Now we have 0 images (user deleted them all)
    if (
      initializedRef.current && 
      imageSource === 'upload' && 
      uploadedImages.length === 0 && 
      previousUploadedImagesLength.current > 0
    ) {
      console.log('📁 All uploaded images removed, switching to Unsplash');
      updateBackgroundSettings({
        imageSource: 'category'
      });
    }
    
    // Update the previous count
    previousUploadedImagesLength.current = uploadedImages.length;
  }, [uploadedImages.length, imageSource]);

  return {
    currentImage,
    loading,
    placeholderUrl,
    isUsingFallback,
    cacheInfo: {
      totalImages: imageSource === 'upload' ? uploadedImages.length : imageCache.images.length,
      currentIndex: imageSource === 'upload' ? currentUploadedImageIndex : imageCache.currentIndex,
      category: imageCache.category,
      lastFetchTime: imageCache.lastFetchTime,
      imageSource
    }
  };
};
