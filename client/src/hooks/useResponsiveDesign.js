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
    let timeoutId;

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
        setViewport('md');      // Large tablets/laptops
      } else if (width < 1800) {
        setViewport('lg');      // Desktop monitors
      } else if (width < 3000) {
        setViewport('xl');      // Large monitors (1800-2999px)
      } else {
        setViewport('xxl');     // Ultra-wide/high-res monitors (3000px+)
      }

      // Improved scale factor calculation with browser chrome compensation
      const baseHeight = 800; // Lowered from 900 for better laptop compatibility
      const minScale = 0.5;
      const maxScale = 1.2;
      
      // Compensate for browser chrome (address bar, toolbars, etc.)
      const chromeCompensation = 120;
      const effectiveHeight = height - chromeCompensation;
      
      let calculatedScale = Math.max(effectiveHeight, height * 0.8) / baseHeight;
      
      // Apply landscape scaling only when needed
      if (landscape && height <= 800) {
        calculatedScale = calculatedScale * 0.8;
      } else if (height < 800) { // Updated threshold
        calculatedScale = calculatedScale * 0.9;
      }
      
      calculatedScale = Math.max(minScale, Math.min(maxScale, calculatedScale));
      setScaleFactor(calculatedScale);
    };

    // Debounced resize handler
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewport, 300);
    };

    updateViewport();
    window.addEventListener('resize', debouncedUpdate);
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  return { viewport, dimensions, scaleFactor, isLandscape };
};

/**
 * Get responsive configuration for components
 */
export const getResponsiveConfig = (viewport, scaleFactor = 1, isLandscape = false) => {
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
    md: {   // Large tablets/small laptops (900-1399px)
      containerWidth: '100%',
      componentWidth: isLandscape ? '90%' : '85%',
      maxWidth: isLandscape ? `${1100 * scaleFactor}px` : `${800 * scaleFactor}px`,
      fontSize: {
        arabic: `${1.7 * scaleFactor}rem`,
        translation: `${1.1 * scaleFactor}rem`,
        timeVariant: 'h4',
        weatherTime: 'h4'
      },
      spacing: {
        container: 2 * scaleFactor,
        component: 2 * scaleFactor,
        card: isLandscape ? 1.5 * scaleFactor : 2.5 * scaleFactor
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
export const getContainerStyles = (viewport, config, scaleFactor = 1, isLandscape = false) => {
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
      minHeight: "calc(100dvh - 1rem)", // Use dvh for better mobile compatibility
      justifyContent: "center",
    };
  }

  // Special handling for landscape mode on laptops/tablets
  if (isLandscape && (viewport === 'md' || viewport === 'lg')) {
    return {
      ...baseStyles,
      minHeight: "100dvh", // Use dvh for better mobile compatibility
      justifyContent: "flex-start",
      paddingTop: `${0.3 * scaleFactor}rem`,
      paddingBottom: `${0.5 * scaleFactor}rem`,
      overflow: "auto",
      gap: `${0.2 * scaleFactor}rem`,
    };
  }

  // For all other screens (portrait mode), use centered layout
  return {
    ...baseStyles,
    minHeight: "100dvh", // Use dvh for better mobile compatibility
    justifyContent: "center",
    overflow: "auto",
  };
};

/**
 * Get component-specific responsive styles
 */
export const getComponentStyles = (viewport, config, componentType = 'default', scaleFactor = 1) => {
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
