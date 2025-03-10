/**
 * Hook for managing theme across platforms
 * Provides a consistent theming solution for both web and mobile applications
 */

import { useState, useEffect, useCallback } from 'react';
import { Theme, ColorPalette } from '@boats/types';
import { isWeb, isIOS, isAndroid } from '@boats/core';

// Define base themes that work across platforms
const lightColors: ColorPalette = {
  primary: '#0066B2',
  secondary: '#00A9E0',
  accent: '#FF6B35',
  background: '#FFFFFF',
  surface: '#F5F7FA',
  error: '#D32F2F',
  text: {
    primary: '#222222',
    secondary: '#555555',
    disabled: '#999999',
    inverse: '#FFFFFF'
  },
  common: {
    white: '#FFFFFF',
    black: '#000000'
  }
};

const darkColors: ColorPalette = {
  primary: '#0088CC',
  secondary: '#00B8F0',
  accent: '#FF7F50',
  background: '#121212',
  surface: '#1E1E1E',
  error: '#EF5350',
  text: {
    primary: '#EEEEEE',
    secondary: '#AAAAAA',
    disabled: '#666666',
    inverse: '#000000'
  },
  common: {
    white: '#FFFFFF',
    black: '#000000'
  }
};

// Base typography settings
const typography = {
  fontFamily: {
    primary: isWeb() 
      ? "'Roboto', 'Helvetica', 'Arial', sans-serif" 
      : isIOS() 
        ? 'System' 
        : 'Roboto',
    secondary: isWeb() 
      ? "'Open Sans', 'Helvetica', 'Arial', sans-serif" 
      : isIOS() 
        ? 'System' 
        : 'Roboto',
    monospace: isWeb() 
      ? "'Roboto Mono', monospace" 
      : 'monospace',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    bold: 700,
  },
};

// Base spacing settings
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Base border radius settings
const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 16,
  round: '50%',
};

// Define the light and dark themes
const lightTheme: Theme = {
  colors: lightColors,
  typography,
  spacing,
  borderRadius,
  isDark: false,
};

const darkTheme: Theme = {
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
  isDark: true,
};

interface ThemeOptions {
  initialTheme?: 'light' | 'dark';
  useSystemPreference?: boolean;
}

/**
 * Hook for managing theme across platforms
 */
export function useTheme(options: ThemeOptions = {}) {
  const { 
    initialTheme = 'light',
    useSystemPreference = true
  } = options;
  
  // State for current theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // If using system preference, check for system dark mode
    if (useSystemPreference) {
      if (isWeb() && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      // For React Native, we'd use Appearance API, but we'll default to initialTheme
      // This would be platform-specific in the actual implementation
    }
    
    // Default to initial theme
    return initialTheme === 'dark';
  });
  
  // Get the current theme object
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  // Function to toggle theme
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);
  
  // Function to explicitly set theme
  const setTheme = useCallback((mode: 'light' | 'dark') => {
    setIsDarkMode(mode === 'dark');
  }, []);
  
  // Listen for system theme changes if using system preference
  useEffect(() => {
    if (useSystemPreference && isWeb() && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (event: MediaQueryListEvent) => {
        setIsDarkMode(event.matches);
      };
      
      // Add listener for theme changes
      mediaQuery.addEventListener('change', handleChange);
      
      // Clean up listener
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [useSystemPreference]);
  
  return {
    theme,
    isDarkMode,
    toggleTheme,
    setTheme,
  };
}
