import { useState, useEffect } from 'react';

/**
 * Custom responsive design hook optimized for IlmTab
 * Preserves perfect large screen experience while adapting to smaller screens
 */
export const useResponsiveDesign = () => {
  const [viewport, setViewport] = useState('xl');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scaleFactor, setScaleFactor] = useState(1);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });
      
      // Detect landscape orientation
      const landscape = width > height;
      setIsLandscape(landscape);

      // Breakpoints optimized for the app's usage
      if (width < 600) {
        setViewport('xs');      // Mobile phones
      } else if (width < 900) {
        setViewport('sm');      // Small tablets
      } else if (width < 1400) {
        setViewport('md');      // Large tablets/laptops (including 1280x800)
      } else if (width < 1800) {
        setViewport('lg');      // Desktop monitors
      } else if (width < 3000) {
        setViewport('xl');      // Large monitors (1800-2999px) - includes 2560x1600
      } else {
        setViewport('xxl');     // Ultra-wide/high-res monitors (3000px+) - 32" 4K monitors
      }

      // Calculate scale factor based on viewport height and orientation
      const baseHeight = 900; // Base height for scaling
      const minScale = 0.45; // More aggressive for landscape
      const maxScale = 1.2; // Don't scale above 120%
      
      let calculatedScale = height / baseHeight;
      
      // Special handling for landscape orientation - LESS AGGRESSIVE SCALING
      if (landscape && height === 768) {
        // More generous scaling for 1366x768 laptops
        calculatedScale = calculatedScale * 0.85; // Only 15% reduction for 1366x768
      } else if (landscape && height <= 800) {
        // Less aggressive scaling for other landscape modes
        calculatedScale = calculatedScale * 0.75; // 25% reduction for landscape
      } else if (landscape && height <= 900) {
        calculatedScale = calculatedScale * 0.8; // 20% reduction for landscape
      } else if (height <= 800) {
        calculatedScale = calculatedScale * 0.85; // 15% reduction for portrait
      } else if (height < 900) {
        calculatedScale = calculatedScale * 0.9; // 10% reduction for smaller screens
      }
      
      calculatedScale = Math.max(minScale, Math.min(maxScale, calculatedScale));
      
      setScaleFactor(calculatedScale);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return { viewport, dimensions, scaleFactor, isLandscape };
};

/**
 * Get responsive configuration for components
 */
export const getResponsiveConfig = (viewport, scaleFactor = 1, isLandscape = false, dimensions = {}) => {
  // Detect specific resolutions for ultra-optimization
  const is1366x768 = dimensions.width === 1366 && dimensions.height === 768;
  const is2560x1600 = dimensions.width === 2560 && dimensions.height === 1600;
  
  const configs = {
    xs: {   // Mobile phones (320-599px)
      containerWidth: '100%',
      componentWidth: '95%',
      maxWidth: `${400 * scaleFactor}px`,
      fontSize: {
        arabic: `${1.2 * scaleFactor}rem`,
        translation: `${0.9 * scaleFactor}rem`,
        timeVariant: 'h5',
        weatherTime: 'h6'
      },
      spacing: {
        container: 1 * scaleFactor,
        component: 1 * scaleFactor,
        card: 1.5 * scaleFactor
      },
      layout: 'compact',
      hideSecondary: true
    },
    sm: {   // Small tablets (600-899px)
      containerWidth: '100%',
      componentWidth: '95%',
      maxWidth: `${600 * scaleFactor}px`,
      fontSize: {
        arabic: `${1.4 * scaleFactor}rem`,
        translation: `${0.95 * scaleFactor}rem`,
        timeVariant: 'h4',
        weatherTime: 'h5'
      },
      spacing: {
        container: 1.5 * scaleFactor,
        component: 1.5 * scaleFactor,
        card: 2 * scaleFactor
      },
      layout: 'compact',
      hideSecondary: false
    },
    md: {   // Large tablets/small laptops (900-1199px)
      containerWidth: '100%',
      componentWidth: is1366x768 ? '95%' : (isLandscape ? '90%' : '85%'), // WIDER for 1366x768
      maxWidth: is1366x768 ? `${1200 * scaleFactor}px` : (isLandscape ? `${1100 * scaleFactor}px` : `${800 * scaleFactor}px`), // WIDER max width for 1366x768
      fontSize: {
        arabic: `${1.7 * scaleFactor}rem`,
        translation: `${1.1 * scaleFactor}rem`,
        timeVariant: 'h4',
        weatherTime: 'h4'
      },
      spacing: {
        container: is1366x768 ? 1.5 * scaleFactor : 2 * scaleFactor,
        component: is1366x768 ? 1.5 * scaleFactor : 2 * scaleFactor,
        card: is1366x768 ? 1.2 * scaleFactor : (isLandscape ? 1.5 * scaleFactor : 2.5 * scaleFactor) // MORE GENEROUS spacing for 1366x768
      },
      layout: 'standard',
      hideSecondary: false
    },
    lg: {   // Desktop/laptops (1200-1599px)
      containerWidth: '100%',
      componentWidth: isLandscape ? '95%' : '70%', // WIDER in landscape
      maxWidth: isLandscape ? `${1400 * scaleFactor}px` : `${900 * scaleFactor}px`, // WIDER max width in landscape
      fontSize: {
        arabic: `${1.8 * scaleFactor}rem`,
        translation: `${1.1 * scaleFactor}rem`,
        timeVariant: 'h3',
        weatherTime: 'h3'
      },
      spacing: {
        container: 2.5 * scaleFactor,
        component: 2.5 * scaleFactor,
        card: isLandscape ? 1.2 * scaleFactor : 3 * scaleFactor // SMALLER spacing in landscape
      },
      layout: 'standard',
      hideSecondary: false
    },
    xl: {   // Large monitors (1800-2999px) - PERFECT FOR ALL XL SCREENS
      containerWidth: '100%',
      componentWidth: '60%', // Same width for all xl screens
      maxWidth: '1000px', // Same max width for all xl screens
      fontSize: {
        arabic: '1.9rem', // Same text size for all xl screens
        translation: '1.15rem', // Same translation text for all xl screens
        timeVariant: 'h3',
        weatherTime: 'h3'
      },
      spacing: {
        container: 3, // Same spacing for all xl screens
        component: 3, // Same spacing for all xl screens
        card: 3 // Same spacing for all xl screens
      },
      layout: 'standard',
      hideSecondary: false
    },
    xxl: {  // Ultra-wide/high-res monitors (3000px+) - PERFECT FOR 32" 4K MONITORS
      containerWidth: '100%',
      componentWidth: '60%', // Perfect width for 32" monitors
      maxWidth: '1000px', // Original perfect max width
      fontSize: {
        arabic: '1.9rem', // Original perfect text size
        translation: '1.15rem',
        timeVariant: 'h3',
        weatherTime: 'h3'
      },
      spacing: {
        container: 3, // Original perfect spacing
        component: 3,
        card: 3
      },
      layout: 'standard',
      hideSecondary: false
    }
  };

  return configs[viewport] || configs.xl;
};

/**
 * Get container styles based on viewport and orientation
 */
export const getContainerStyles = (viewport, config, scaleFactor = 1, isLandscape = false, dimensions = {}) => {
  // Detect specific resolutions for ultra-optimization
  const is1366x768 = dimensions.width === 1366 && dimensions.height === 768;
  const is2560x1600 = dimensions.width === 2560 && dimensions.height === 1600;
  
  const baseStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    px: config.spacing.container * scaleFactor,
    py: config.spacing.container * scaleFactor,
    position: "relative",
    zIndex: 1,
  };

  // For very large screens, keep the perfect centered layout
  if (viewport === 'xl' || viewport === 'xxl') {
    return {
      ...baseStyles,
      minHeight: "calc(100vh - 1rem)",
      justifyContent: "center",
    };
  }

  // Special handling for landscape mode on laptops/tablets
  if (isLandscape && (viewport === 'md' || viewport === 'lg')) {
    return {
      ...baseStyles,
      minHeight: "100vh",
      justifyContent: "flex-start", // Start from top like portrait
      paddingTop: is1366x768 ? `${0.5 * scaleFactor}rem` : `${0.3 * scaleFactor}rem`, // MORE GENEROUS for 1366x768
      paddingBottom: is1366x768 ? `${0.5 * scaleFactor}rem` : `${0.5 * scaleFactor}rem`, // MORE GENEROUS for 1366x768
      overflow: "auto", // Allow scrolling when needed
      gap: is1366x768 ? `${0.3 * scaleFactor}rem` : `${0.2 * scaleFactor}rem`, // MORE GENEROUS gaps for 1366x768
    };
  }

  // For all other screens (portrait mode), use the working layout
  return {
    ...baseStyles,
    minHeight: "100vh",
    justifyContent: "flex-start", // Start from top
    paddingTop: `${0.3 * scaleFactor}rem`,
    paddingBottom: `${0.5 * scaleFactor}rem`,
    overflow: "auto", // Allow scrolling when needed
    gap: `${0.2 * scaleFactor}rem`, // Small gaps
  };
};

/**
 * Get component-specific responsive styles
 */
export const getComponentStyles = (viewport, config, componentType = 'default', scaleFactor = 1, dimensions = {}) => {
  // Detect 2560x1600 for taller components
  const is2560x1600 = dimensions.width === 2560 && dimensions.height === 1600;
  
  const baseStyles = {
    width: config.componentWidth,
    maxWidth: config.maxWidth,
    mx: "auto",
  };

  switch (componentType) {
    case 'ayah-card':
      return {
        ...baseStyles,
        margin: `${config.spacing.card}rem auto`,
      };

    case 'weather':
      return {
        ...baseStyles,
        width: config.componentWidth,
        maxWidth: config.maxWidth,
      };

    case 'mode-toggle':
      return {
        mb: config.spacing.component,
        transform: `scale(${viewport === 'xs' ? 0.9 * scaleFactor : 1 * scaleFactor})`,
      };

    case 'content-container':
      return {
        width: "100%",
        maxWidth: viewport === 'xs' ? '95%' : config.maxWidth,
        mx: "auto",
      };

    default:
      return baseStyles;
  }
};

/**
 * Get typography styles based on viewport
 */
export const getTypographyStyles = (viewport, config, textType = 'default') => {
  switch (textType) {
    case 'arabic':
      return {
        fontSize: { xs: config.fontSize.arabic },
        lineHeight: viewport === 'xs' ? 1.4 : 1.6,
      };

    case 'translation':
      return {
        fontSize: { xs: config.fontSize.translation },
        lineHeight: viewport === 'xs' ? 1.3 : 1.4,
      };

    case 'time':
      return {
        variant: config.fontSize.timeVariant,
      };

    case 'weather-time':
      return {
        variant: config.fontSize.weatherTime,
      };

    default:
      return {};
  }
};

/**
 * Check if component should be hidden on small screens
 */
export const shouldHideComponent = (viewport, config, componentPriority = 1) => {
  if (config.hideSecondary && componentPriority > 1) {
    return true;
  }
  return false;
};

/**
 * Get responsive gap/spacing values
 */
export const getSpacing = (viewport, config, spacingType = 'default') => {
  switch (spacingType) {
    case 'component':
      return config.spacing.component;
    case 'container':
      return config.spacing.container;
    case 'card':
      return config.spacing.card;
    default:
      return config.spacing.component;
  }
};
