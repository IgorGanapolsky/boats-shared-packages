/**
 * Core functionality for Boats.com applications
 * This package provides business logic, utilities, and services
 * that can be shared across web and mobile platforms.
 */

// Export all services
export * from './services/openai.service';
export * from './services/tensorflow.service';
export * from './services/boat-comparison.service';
export * from './services/image-analysis.service';

// Export all utilities
export * from './utils/network.utils';
export * from './utils/boat-matching.utils';
export * from './utils/similarity.utils';

// Export platform detection utilities 
// Export specific functions to avoid name conflicts
import { 
  isWeb, 
  isReactNative, 
  isIOS, 
  isAndroid, 
  isNode, 
  getPlatform 
} from './utils/platform.utils';
export { 
  isWeb, 
  isReactNative, 
  isIOS, 
  isAndroid, 
  isNode, 
  getPlatform 
};

// Export config management
export * from './config/environment';

// Types are now in the types package
