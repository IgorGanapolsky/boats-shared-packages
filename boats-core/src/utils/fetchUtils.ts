/**
 * Utility functions for fetch operations
 */

interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number;
}

/**
 * Extends the native fetch API with timeout capability
 * @param {string} url - The URL to fetch
 * @param {FetchWithTimeoutOptions} options - Standard fetch options with timeout
 * @returns {Promise<Response>} - Promise that resolves with the fetch response or rejects on timeout
 */
export const fetchWithTimeout = (url: string, options: FetchWithTimeoutOptions = {}): Promise<Response> => {
    const { timeout = 8000, ...fetchOptions } = options;

    return Promise.race([
        fetch(url, fetchOptions),
        new Promise<Response>((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Request timed out after ${timeout}ms`));
            }, timeout);
        })
    ]);
};

/**
 * Handles JSON responses with appropriate error checking
 * @param {Response} response - The fetch Response object
 * @returns {Promise<any>} - Promise that resolves with the parsed JSON data
 */
export const handleJsonResponse = async (response: Response): Promise<any> => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    try {
        return await response.json();
    } catch (error) {
        throw new Error(`Failed to parse JSON response: ${(error as Error).message}`);
    }
};
