/**
 * Environment configuration management
 * Provides a unified way to access environment variables across platforms
 */

import { EnvironmentConfig } from '@igorganapolsky/boats-types';

/**
 * Default environment configuration
 */
const defaultConfig: EnvironmentConfig = {
  apiUrl: 'http://localhost:3000/api',
  tensorflowEnabled: true,
  featureFlags: {
    experimentalFeatures: false,
    proMode: false,
    debugMode: false
  }
};

/**
 * Get environment variables safely with fallbacks
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  // Handle different environments (web, React Native)
  // Determine which environment object to use
  let env: Record<string, string | undefined> = {};
  if (typeof process !== 'undefined' && process.env) {
    env = process.env as Record<string, string | undefined>;
  } else if (typeof globalThis !== 'undefined' && (globalThis as any).env) {
    env = (globalThis as any).env as Record<string, string | undefined>;
  }
  
  return {
    apiUrl: env.REACT_APP_API_URL || env.EXPO_API_URL || defaultConfig.apiUrl,
    openAiApiKey: env.REACT_APP_OPENAI_API_KEY || env.EXPO_OPENAI_API_KEY,
    tensorflowEnabled: env.REACT_APP_TENSORFLOW_ENABLED === 'true' || 
                      env.EXPO_TENSORFLOW_ENABLED === 'true' || 
                      defaultConfig.tensorflowEnabled,
    featureFlags: {
      experimentalFeatures: env.REACT_APP_EXPERIMENTAL_FEATURES === 'true' || 
                           env.EXPO_EXPERIMENTAL_FEATURES === 'true' || 
                           defaultConfig.featureFlags.experimentalFeatures,
      proMode: env.REACT_APP_PRO_MODE === 'true' || 
              env.EXPO_PRO_MODE === 'true' || 
              defaultConfig.featureFlags.proMode,
      debugMode: env.REACT_APP_DEBUG_MODE === 'true' || 
                env.EXPO_DEBUG_MODE === 'true' || 
                defaultConfig.featureFlags.debugMode
    }
  };
}

/**
 * Get a specific environment variable
 */
export function getEnvVar(name: string, defaultValue: string = ''): string {
  if (typeof process !== 'undefined' && process.env) {
    // Web environment
    const webVar = process.env[`REACT_APP_${name}`];
    if (webVar !== undefined) return webVar;
  }
  
  if (typeof globalThis !== 'undefined') {
    // React Native / Expo environment
    const expoVar = (globalThis as any).env?.[`EXPO_${name}`];
    if (expoVar !== undefined) return expoVar;
  }
  
  return defaultValue;
}

/**
 * Determine if code is running in development mode
 */
export function isDevelopment(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development';
  }
  
  // For React Native environments
  try {
    // @ts-ignore - __DEV__ is defined in React Native
    if (typeof __DEV__ !== 'undefined') {
      // @ts-ignore
      return __DEV__ === true;
    }
  } catch (e) {
    // Ignore error if __DEV__ is not defined
  }
  
  return false;
}

/**
 * Determine if code is running in a web environment
 */
export function isWeb(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Determine if code is running in React Native
 */
export function isReactNative(): boolean {
  // Check for React Native environment
  // navigator.product is deprecated, using a more reliable check
  return typeof navigator !== 'undefined' && 
    // @ts-ignore
    // Removed deprecated navigator.product check
    (typeof navigator !== 'undefined' && ('ReactNative' in navigator) || 
     // Check for newer RN environment indicators
     typeof global !== 'undefined' && 
     // Use 'in' operator instead of hasOwnProperty
     ('ReactNative' in global));
}

/**
 * Determine if code is running on iOS
 */
export function isIOS(): boolean {
  if (!isReactNative()) return false;
  
  return typeof navigator !== 'undefined' && 
         /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Determine if code is running on Android
 */
export function isAndroid(): boolean {
  if (!isReactNative()) return false;
  
  return typeof navigator !== 'undefined' && 
         /android/i.test(navigator.userAgent);
}
