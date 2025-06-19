/**
 * Image optimization utilities inspired by Tabliss
 * Optimizes Unsplash images for performance and caching
 */

/**
 * Calculate optimal image width based on screen size and pixel ratio
 * Snaps to 240px increments for better Unsplash CDN caching
 */
export function calculateOptimalWidth(screenWidth = 1920, pixelRatio = 1) {
  // Calculate true resolution considering pixel ratio
  let targetWidth = screenWidth * pixelRatio;
  
  // Set reasonable bounds
  targetWidth = Math.max(targetWidth, 1920); // Minimum 1920px for quality
  targetWidth = Math.min(targetWidth, 3840); // Maximum 4K to avoid huge files
  
  // Snap to 240px increments for optimal Unsplash CDN caching
  // This improves cache hit rates and reduces bandwidth
  targetWidth = Math.ceil(targetWidth / 240) * 240;
  
  return targetWidth;
}

/**
 * Build optimized Unsplash image URL with responsive sizing and quality
 * For local images, returns the original URL unchanged
 */
export function buildOptimizedImageUrl(rawUrl, options = {}) {
  if (!rawUrl) return null;
  
  // If it's a local/relative path, return as-is
  if (rawUrl.startsWith('/') || !rawUrl.includes('://')) {
    return rawUrl;
  }
  
  const {
    quality = 85,           // 85% quality - sweet spot for size vs quality
    width = null,           // Auto-calculate if not provided
    height = null,          // Optional height constraint
    fit = 'crop',           // How to fit the image
    format = 'auto'         // Let Unsplash choose best format (WebP when supported)
  } = options;
  
  try {
    const url = new URL(rawUrl);
    
    // Set quality (85% is optimal balance)
    url.searchParams.set('q', String(quality));
    
    // Set responsive width
    const optimalWidth = width || calculateOptimalWidth(
      window.innerWidth, 
      window.devicePixelRatio || 1
    );
    url.searchParams.set('w', String(optimalWidth));
    
    // Set height if specified
    if (height) {
      url.searchParams.set('h', String(height));
    }
    
    // Set fit mode
    url.searchParams.set('fit', fit);
    
    // Enable auto format (WebP when supported)
    url.searchParams.set('fm', format);
    
    // Enable auto enhancement
    url.searchParams.set('auto', 'enhance');
    
    return url.toString();
  } catch (error) {
    console.error('Failed to optimize image URL:', error);
    return rawUrl; // Fallback to original URL
  }
}

/**
 * Create a low-quality placeholder URL for progressive loading
 * For local images, returns null (no placeholder needed)
 */
export function buildPlaceholderUrl(rawUrl) {
  if (!rawUrl) return null;
  
  // If it's a local/relative path, no placeholder needed
  if (rawUrl.startsWith('/') || !rawUrl.includes('://')) {
    return null;
  }
  
  try {
    const url = new URL(rawUrl);
    
    // Very small size for instant loading
    url.searchParams.set('w', '40');
    url.searchParams.set('h', '30');
    url.searchParams.set('q', '20'); // Low quality for small size
    url.searchParams.set('blur', '200'); // Heavy blur
    url.searchParams.set('fm', 'jpg'); // JPEG for smaller blur images
    
    return url.toString();
  } catch (error) {
    console.error('Failed to create placeholder URL:', error);
    return null;
  }
}

/**
 * Preload an image and return a promise
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
    
    // Timeout after 10 seconds
    setTimeout(() => reject(new Error('Image load timeout')), 10000);
  });
}

/**
 * Progressive image loading with blur placeholder
 */
export async function loadImageProgressively(rawUrl, onProgress = () => {}) {
  if (!rawUrl) throw new Error('No image URL provided');
  
  const placeholderUrl = buildPlaceholderUrl(rawUrl);
  const optimizedUrl = buildOptimizedImageUrl(rawUrl);
  
  try {
    // Step 1: Load tiny blurred placeholder instantly
    if (placeholderUrl) {
      onProgress({ stage: 'placeholder', url: placeholderUrl });
      await preloadImage(placeholderUrl);
    }
    
    // Step 2: Load optimized full image
    onProgress({ stage: 'loading', url: optimizedUrl });
    await preloadImage(optimizedUrl);
    
    // Step 3: Image ready
    onProgress({ stage: 'loaded', url: optimizedUrl });
    
    return optimizedUrl;
  } catch (error) {
    console.error('Progressive image loading failed:', error);
    throw error;
  }
}

/**
 * Image cache for storing optimized URLs
 */
class ImageCache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  set(key, value) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      ...value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if item is still fresh (24 hours)
    const isExpired = Date.now() - item.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return item;
  }
  
  clear() {
    this.cache.clear();
  }
}

// Global image cache instance
export const imageCache = new ImageCache();

/**
 * Get device-specific image sizing info for debugging
 */
export function getImageSizingInfo() {
  const screenWidth = window.innerWidth;
  const pixelRatio = window.devicePixelRatio || 1;
  const optimalWidth = calculateOptimalWidth(screenWidth, pixelRatio);
  
  return {
    screenWidth,
    pixelRatio,
    trueResolution: screenWidth * pixelRatio,
    optimalWidth,
    estimatedSize: `${Math.round(optimalWidth * 0.4 / 1024)}KB`, // Rough estimate
    deviceType: screenWidth < 768 ? 'mobile' : screenWidth < 1200 ? 'tablet' : 'desktop'
  };
}
