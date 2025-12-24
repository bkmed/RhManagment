import React from 'react';
import { Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const responsive = {
  // Breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
  },

  // Check platform
  isWeb: Platform.OS === 'web',
  isMobile: Platform.OS === 'ios' || Platform.OS === 'android',

  // Responsive helpers
  isMobileWidth: width < 768,
  isTabletWidth: width >= 768 && width < 1024,
  isDesktopWidth: width >= 1024,

  // Get columns for responsive grid
  getColumns: () => {
    if (width >= 1440) return 4;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  },

  // Get container max width
  getContainerWidth: () => {
    if (width >= 1440) return 1400;
    if (width >= 1024) return 960;
    if (width >= 768) return 720;
    return width - 32;
  },

  // Responsive padding
  getPadding: () => {
    if (width >= 1024) return 24;
    if (width >= 768) return 20;
    return 16;
  },
};

// Hook for responsive updates
export const useResponsive = () => {
  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  return {
    width: dimensions.width,
    height: dimensions.height,
    isMobile: dimensions.width < 768,
    isTablet: dimensions.width >= 768 && dimensions.width < 1024,
    isDesktop: dimensions.width >= 1024,
    columns: responsive.getColumns(),
  };
};
