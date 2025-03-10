/**
 * Type definitions for network utilities
 */

/**
 * Options for fetch with timeout
 */
export interface FetchWithTimeoutOptions extends RequestInit {
  /**
   * Timeout in milliseconds
   * @default 30000
   */
  timeout?: number;
}

/**
 * Generic API response type
 */
export interface ApiResponse<T = any> {
  /**
   * Whether the API call was successful
   */
  success: boolean;
  
  /**
   * Response data
   */
  data: T;
  
  /**
   * Optional message from the API
   */
  message?: string;
  
  /**
   * Optional error information
   */
  error?: {
    code?: string;
    details?: any;
  };
}
