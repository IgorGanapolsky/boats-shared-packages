/**
 * Platform detection utilities
 * These utilities help detect which platform the code is running on
 */

/**
 * Check if the code is running in a web environment
 */
export function isWeb(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if the code is running in a React Native environment
 */
export function isReactNative(): boolean {
  // Modern detection approach instead of using deprecated navigator.product
  return typeof navigator !== 'undefined' && 
    // Check for React Native specific globals or user agent
    (typeof navigator !== 'undefined' && 
     /react\s?native/i.test(navigator.userAgent));
}

/**
 * Check if the code is running on iOS
 */
export function isIOS(): boolean {
  if (!isReactNative()) return false;
  
  return (
    typeof navigator !== 'undefined' && 
    /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase())
  );
}

/**
 * Check if the code is running on Android
 */
export function isAndroid(): boolean {
  if (!isReactNative()) return false;
  
  return (
    typeof navigator !== 'undefined' && 
    /android/i.test(navigator.userAgent.toLowerCase())
  );
}

/**
 * Check if the code is running in a Node.js environment
 */
export function isNode(): boolean {
  return (
    typeof process !== 'undefined' && 
    process.versions?.node != null
  );
}

/**
 * Get the current platform
 */
export function getPlatform(): 'web' | 'ios' | 'android' | 'node' | 'unknown' {
  if (isWeb()) return 'web';
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  if (isNode()) return 'node';
  return 'unknown';
}
