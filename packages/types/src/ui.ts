/**
 * Type definitions for UI components that work across platforms
 */

// Common theme types for both web and mobile
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  error: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  common: {
    white: string;
    black: string;
  };
}

export interface Typography {
  fontFamily: {
    primary: string;
    secondary?: string;
    monospace?: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    bold: number;
  };
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface BorderRadius {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  round: string;
}

export interface Theme {
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  isDark: boolean;
}

// Component-specific prop types that work across platforms
export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

export interface CardProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  elevation?: number;
  variant?: 'outlined' | 'elevated';
}

export interface ImageViewerProps {
  imageUrl: string;
  alt?: string;
  aspectRatio?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  onPress?: () => void;
  onError?: () => void;
}

export interface BoatCardProps {
  boat: import('./index').Boat;
  onSelect?: () => void;
  selected?: boolean;
  showDetails?: boolean;
  horizontal?: boolean;
}

// Platform-specific overrides
export interface PlatformSpecificProps {
  web?: Record<string, any>;
  ios?: Record<string, any>;
  android?: Record<string, any>;
}
