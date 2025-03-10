/**
 * Network utilities for making API requests
 * These utilities are designed to work in both web and React Native environments
 */

// Define our own FetchWithTimeoutOptions interface for now to avoid circular dependencies
// Will be replaced by @boats/types when the package is published
interface FetchWithTimeoutOptions extends RequestInit {
  /**
   * Timeout in milliseconds
   * @default 30000
   */
  timeout?: number;
}

/**
 * Default timeout for network requests in milliseconds
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * Enhanced fetch with timeout and error handling
 * Works in both web and React Native environments
 */
export async function fetchWithTimeout<T>(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
  
  // Create an abort controller to handle timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    
    // Clear the timeout as we got a response
    clearTimeout(timeoutId);
    
    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
    }
    
    // Parse the response based on content-type
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return await response.json() as T;
    } else if (contentType.includes('text/')) {
      return await response.text() as unknown as T;
    } else {
      return await response.blob() as unknown as T;
    }
  } catch (error) {
    // Clear the timeout in case of an error
    clearTimeout(timeoutId);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
    }
    
    // Re-throw the original error
    throw error;
  }
}

/**
 * Helper method for making GET requests
 */
export async function get<T>(url: string, options: FetchWithTimeoutOptions = {}): Promise<T> {
  return fetchWithTimeout<T>(url, {
    method: 'GET',
    ...options
  });
}

/**
 * Helper method for making POST requests
 */
export async function post<T>(
  url: string, 
  data: any,
  options: FetchWithTimeoutOptions = {}
): Promise<T> {
  const headers: Record<string, string> = options.headers ? { ...options.headers as Record<string, string> } : {};
  
  // Automatically set content-type header for JSON data if not specified
  if (typeof data === 'object' && data !== null && !headers['Content-Type'] && !(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  return fetchWithTimeout<T>(url, {
    method: 'POST',
    body: typeof data === 'object' && !(data instanceof FormData) ? JSON.stringify(data) : data,
    headers,
    ...options
  });
}

/**
 * Helper method for making PUT requests
 */
export async function put<T>(
  url: string,
  data: any,
  options: FetchWithTimeoutOptions = {}
): Promise<T> {
  const headers: Record<string, string> = options.headers ? { ...options.headers as Record<string, string> } : {};
  
  // Automatically set content-type header for JSON data if not specified
  if (typeof data === 'object' && data !== null && !headers['Content-Type'] && !(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  return fetchWithTimeout<T>(url, {
    method: 'PUT',
    body: typeof data === 'object' && !(data instanceof FormData) ? JSON.stringify(data) : data,
    headers,
    ...options
  });
}

/**
 * Helper method for making PATCH requests
 */
export async function patch<T>(
  url: string,
  data: any,
  options: FetchWithTimeoutOptions = {}
): Promise<T> {
  const headers: Record<string, string> = options.headers ? { ...options.headers as Record<string, string> } : {};
  
  // Automatically set content-type header for JSON data if not specified
  if (typeof data === 'object' && data !== null && !headers['Content-Type'] && !(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  return fetchWithTimeout<T>(url, {
    method: 'PATCH',
    body: typeof data === 'object' && !(data instanceof FormData) ? JSON.stringify(data) : data,
    headers,
    ...options
  });
}

/**
 * Helper method for making DELETE requests
 */
export async function del<T>(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<T> {
  return fetchWithTimeout<T>(url, {
    method: 'DELETE',
    ...options
  });
}

/**
 * Helper method to handle API errors consistently
 */
export function handleApiError(error: unknown): Error {
  if (error instanceof Error) {
    // If it's already an Error, return it
    return error;
  }
  
  if (typeof error === 'string') {
    // If it's a string, convert to Error
    return new Error(error);
  }
  
  // Otherwise, create a generic error
  return new Error('An unknown error occurred');
}

/**
 * Create a retry mechanism for API calls
 * @param fn The function to retry
 * @param retries The number of retries
 * @param delay The delay between retries in milliseconds
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    
    // Wait for the specified delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry with exponential backoff
    return withRetry(fn, retries - 1, delay * 2);
  }
}

/**
 * Parse URL parameters into an object
 */
export function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const urlObj = new URL(url);
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * Build URL with query parameters
 */
export function buildUrl(baseUrl: string, params: Record<string, string | number | boolean | undefined | null>): string {
  const url = new URL(baseUrl);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
}
