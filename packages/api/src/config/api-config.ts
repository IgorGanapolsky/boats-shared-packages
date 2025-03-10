/**
 * API configuration for Boats.com applications
 */

import { getEnvironmentConfig } from '@igorganapolsky/boats-core';

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  apiKey?: string;
  authToken?: string;
  headers?: Record<string, string>;
}

/**
 * Default API client configuration
 */
const defaultConfig: ApiClientConfig = {
  baseUrl: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

/**
 * Get the API client configuration with environment variables
 */
export function getApiConfig(overrides: Partial<ApiClientConfig> = {}): ApiClientConfig {
  const env = getEnvironmentConfig();
  
  return {
    ...defaultConfig,
    baseUrl: env.apiUrl,
    apiKey: env.openAiApiKey,
    ...overrides
  };
}

/**
 * Create authenticated headers for API requests
 */
export function createAuthHeaders(
  token?: string, 
  additionalHeaders: Record<string, string> = {}
): Record<string, string> {
  const headers: Record<string, string> = {
    ...defaultConfig.headers,
    ...additionalHeaders
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}
