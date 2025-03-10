/**
 * Authentication API client
 * Provides methods for user authentication across platforms
 */

import { 
  post, 
  get, 
  handleApiError 
} from '@boats/core';
import { 
  ApiResponse,
  UserProfile,
  UserPreferences
} from '@boats/types';
import { ApiClientConfig, getApiConfig, createAuthHeaders } from '../config/api-config';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Seconds until expiration
}

export interface AuthState {
  tokens: AuthTokens | null;
  user: UserProfile | null;
  preferences: UserPreferences | null;
  isAuthenticated: boolean;
}

export class AuthApiClient {
  private config: ApiClientConfig;
  
  constructor(config?: Partial<ApiClientConfig>) {
    this.config = getApiConfig(config);
  }
  
  /**
   * Login with email and password
   */
  async login(credentials: AuthCredentials): Promise<ApiResponse<AuthState>> {
    try {
      const response = await post<ApiResponse<AuthState>>(
        `${this.config.baseUrl}/auth/login`,
        credentials,
        { 
          headers: this.config.headers,
          timeout: this.config.timeout
        }
      );
      
      // Store tokens if successful
      if (response.data?.tokens) {
        this.storeTokens(response.data.tokens);
      }
      
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }
  
  /**
   * Register a new user
   */
  async register(userData: AuthCredentials & Partial<UserProfile>): Promise<ApiResponse<AuthState>> {
    try {
      const response = await post<ApiResponse<AuthState>>(
        `${this.config.baseUrl}/auth/register`,
        userData,
        { 
          headers: this.config.headers,
          timeout: this.config.timeout
        }
      );
      
      // Store tokens if successful
      if (response.data?.tokens) {
        this.storeTokens(response.data.tokens);
      }
      
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }
  
  /**
   * Logout the current user
   */
  async logout(): Promise<ApiResponse<boolean>> {
    try {
      const tokens = this.getTokens();
      const headers = createAuthHeaders(tokens?.accessToken, this.config.headers);
      
      const response = await post<ApiResponse<boolean>>(
        `${this.config.baseUrl}/auth/logout`,
        { refreshToken: tokens?.refreshToken },
        { 
          headers,
          timeout: this.config.timeout
        }
      );
      
      // Clear tokens on successful logout
      this.clearTokens();
      
      return response;
    } catch (error) {
      this.clearTokens(); // Clear tokens even on error
      throw handleApiError(error);
    }
  }
  
  /**
   * Get the current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    try {
      const tokens = this.getTokens();
      const headers = createAuthHeaders(tokens?.accessToken, this.config.headers);
      
      return await get<ApiResponse<UserProfile>>(
        `${this.config.baseUrl}/auth/me`,
        { 
          headers,
          timeout: this.config.timeout
        }
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }
  
  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<ApiResponse<UserPreferences>> {
    try {
      const tokens = this.getTokens();
      const headers = createAuthHeaders(tokens?.accessToken, this.config.headers);
      
      return await get<ApiResponse<UserPreferences>>(
        `${this.config.baseUrl}/auth/preferences`,
        { 
          headers,
          timeout: this.config.timeout
        }
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }
  
  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    try {
      const tokens = this.getTokens();
      const headers = createAuthHeaders(tokens?.accessToken, this.config.headers);
      
      return await post<ApiResponse<UserPreferences>>(
        `${this.config.baseUrl}/auth/preferences`,
        preferences,
        { 
          headers,
          timeout: this.config.timeout
        }
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }
  
  /**
   * Refresh the auth tokens using the refresh token
   */
  async refreshTokens(): Promise<ApiResponse<AuthTokens>> {
    try {
      const tokens = this.getTokens();
      
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await post<ApiResponse<AuthTokens>>(
        `${this.config.baseUrl}/auth/refresh`,
        { refreshToken: tokens.refreshToken },
        { 
          headers: this.config.headers,
          timeout: this.config.timeout
        }
      );
      
      // Store new tokens if successful
      if (response.data) {
        this.storeTokens(response.data);
      }
      
      return response;
    } catch (error) {
      this.clearTokens(); // Clear tokens on refresh error
      throw handleApiError(error);
    }
  }
  
  /**
   * Request a password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<boolean>> {
    try {
      return await post<ApiResponse<boolean>>(
        `${this.config.baseUrl}/auth/reset-password`,
        { email },
        { 
          headers: this.config.headers,
          timeout: this.config.timeout
        }
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }
  
  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return !!tokens?.accessToken;
  }
  
  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.accessToken || null;
  }
  
  /**
   * Store authentication tokens
   * This implementation uses localStorage for web and AsyncStorage for React Native
   */
  private storeTokens(tokens: AuthTokens): void {
    // Browser storage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
      return;
    }
    
    // For React Native, we'd use AsyncStorage but since it's not available here,
    // we'll simulate it with a global variable for cross-platform compatibility
    if (typeof global !== 'undefined') {
      (global as any).__AUTH_TOKENS__ = JSON.stringify(tokens);
    }
  }
  
  /**
   * Get stored authentication tokens
   */
  private getTokens(): AuthTokens | null {
    try {
      // Browser storage
      if (typeof window !== 'undefined' && window.localStorage) {
        const tokens = localStorage.getItem('auth_tokens');
        return tokens ? JSON.parse(tokens) : null;
      }
      
      // For React Native
      if (typeof global !== 'undefined') {
        const tokens = (global as any).__AUTH_TOKENS__;
        return tokens ? JSON.parse(tokens) : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing auth tokens:', error);
      return null;
    }
  }
  
  /**
   * Clear stored authentication tokens
   */
  private clearTokens(): void {
    // Browser storage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('auth_tokens');
      return;
    }
    
    // For React Native
    if (typeof global !== 'undefined') {
      delete (global as any).__AUTH_TOKENS__;
    }
  }
}
