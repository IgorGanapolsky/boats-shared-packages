/**
 * Analytics API client
 * 
 * Provides methods for tracking user interactions and events across web and mobile platforms.
 * This client handles session management, device information collection, and user identification
 * to provide comprehensive analytics data for Boats.com applications.
 * 
 * @example
 * ```typescript
 * import { AnalyticsApiClient } from '@igorganapolsky/boats-api';
 * 
 * const analytics = new AnalyticsApiClient();
 * 
 * // Track a simple event
 * analytics.trackEvent({ eventName: 'view_boat_details', properties: { boatId: '123' } });
 * 
 * // Set user ID for all subsequent events
 * analytics.setUserId('user-456');
 * ```
 */

import { 
  post, 
  isWeb,
  isIOS,
  isAndroid
} from '@igorganapolsky/boats-core';
import { ApiResponse } from '@igorganapolsky/boats-types';
import { ApiClientConfig, getApiConfig, createAuthHeaders } from '../config/api-config';

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
  deviceInfo?: Record<string, any>;
}

export class AnalyticsApiClient {
  private readonly config: ApiClientConfig;
  private readonly sessionId: string;
  private readonly deviceInfo: Record<string, any>;
  private userId: string | null = null;
  
  constructor(config?: Partial<ApiClientConfig>) {
    this.config = getApiConfig(config);
    this.sessionId = this.generateSessionId();
    this.deviceInfo = this.collectDeviceInfo();
  }
  
  /**
   * Track a user event
   * 
   * Sends an analytics event to the server with enriched information including session ID,
   * device information, and timestamp. If a user ID has been set via setUserId(), it will
   * be automatically included with the event.
   * 
   * @param event - Event information including name and optional properties
   * @returns Promise resolving to an API response with a boolean success indicator
   * @throws Error if the network request fails
   * 
   * @example
   * ```typescript
   * analytics.trackEvent({
   *   eventName: 'compare_boats',
   *   properties: { boatIds: ['boat-123', 'boat-456'], featureCompared: 'engine' }
   * });
   * ```
   */
  async trackEvent(event: Omit<AnalyticsEvent, 'sessionId' | 'deviceInfo' | 'timestamp'>): Promise<ApiResponse<boolean>> {
    try {
      const headers = this.userId 
        ? createAuthHeaders(this.config.authToken, this.config.headers) 
        : this.config.headers;
      
      const fullEvent: AnalyticsEvent = {
        ...event,
        userId: event.userId || this.userId || undefined,
        sessionId: this.sessionId,
        deviceInfo: this.deviceInfo,
        timestamp: Date.now()
      };
      
      return await post<ApiResponse<boolean>>(
        `${this.config.baseUrl}/analytics/events`,
        fullEvent,
        { 
          headers,
          timeout: this.config.timeout
        }
      );
    } catch (error) {
      // Don't throw for analytics errors, just log them
      console.error('Analytics error:', error);
      return {
        data: false,
        error: {
          code: 'ANALYTICS_ERROR',
          message: 'Failed to track event'
        }
      };
    }
  }
  
  /**
   * Track a page view event
   * 
   * Convenience method that generates a standardized page_view event.
   * Automatically captures the current URL when available.
   * 
   * @param pageName - The name of the page or screen being viewed
   * @param properties - Additional properties to include with the event
   * @returns Promise resolving to an API response with a boolean success indicator
   * 
   * @example
   * ```typescript
   * analytics.trackPageView('boat_details', { boatId: '123', referrer: 'search' });
   * ```
   */
  async trackPageView(pageName: string, properties: Record<string, any> = {}): Promise<ApiResponse<boolean>> {
    return this.trackEvent({
      eventName: 'page_view',
      properties: {
        pageName,
        url: this.getCurrentUrl(),
        ...properties
      }
    });
  }
  
  /**
   * Track a boat view event
   * 
   * Convenience method for tracking when a user views a specific boat.
   * Useful for understanding which boats receive the most attention.
   * 
   * @param boatId - The unique identifier for the boat being viewed
   * @param boatName - The display name of the boat
   * @param properties - Additional properties to include with the event
   * @returns Promise resolving to an API response with a boolean success indicator
   * 
   * @example
   * ```typescript
   * analytics.trackBoatView('boat-123', 'Sea Ray 350', { source: 'search_results' });
   * ```
   */
  async trackBoatView(boatId: string, boatName: string, properties: Record<string, any> = {}): Promise<ApiResponse<boolean>> {
    return this.trackEvent({
      eventName: 'boat_view',
      properties: {
        boatId,
        boatName,
        ...properties
      }
    });
  }
  
  /**
   * Track a boat comparison event
   * 
   * Records when a user compares two boats. This data is valuable for understanding
   * which boats are frequently compared together and improving comparison features.
   * 
   * @param boat1Id - The unique identifier for the first boat in the comparison
   * @param boat2Id - The unique identifier for the second boat in the comparison
   * @param properties - Additional properties to include with the event
   * @returns Promise resolving to an API response with a boolean success indicator
   * 
   * @example
   * ```typescript
   * analytics.trackBoatComparison('boat-123', 'boat-456', { 
   *   features: ['engine', 'length', 'price'],
   *   initiatedFrom: 'search_results'
   * });
   * ```
   */
  async trackBoatComparison(boat1Id: string, boat2Id: string, properties: Record<string, any> = {}): Promise<ApiResponse<boolean>> {
    return this.trackEvent({
      eventName: 'boat_comparison',
      properties: {
        boat1Id,
        boat2Id,
        ...properties
      }
    });
  }
  
  /**
   * Track a search event
   * 
   * Records when a user performs a search and the number of results returned.
   * Useful for understanding search patterns and improving search functionality.
   * 
   * @param searchQuery - The search terms entered by the user
   * @param resultCount - The number of results returned for the search
   * @param properties - Additional properties to include with the event
   * @returns Promise resolving to an API response with a boolean success indicator
   * 
   * @example
   * ```typescript
   * analytics.trackSearch('center console under 30ft', 12, { 
   *   filters: { maxLength: 30, type: 'center-console' },
   *   sortBy: 'price_asc'
   * });
   * ```
   */
  async trackSearch(searchQuery: string, resultCount: number, properties: Record<string, any> = {}): Promise<ApiResponse<boolean>> {
    return this.trackEvent({
      eventName: 'search',
      properties: {
        searchQuery,
        resultCount,
        ...properties
      }
    });
  }
  
  /**
   * Track a user authentication event
   * 
   * Records user authentication activities (login, register, logout).
   * Automatically updates the internal userId based on the event type.
   * 
   * @param authType - The type of authentication event (login, register, or logout)
   * @param userId - The unique identifier for the user
   * @param properties - Additional properties to include with the event
   * @returns Promise resolving to an API response with a boolean success indicator
   * 
   * @example
   * ```typescript
   * // Track a successful login
   * analytics.trackAuth('login', 'user-123', { method: 'email' });
   * 
   * // Track a logout
   * analytics.trackAuth('logout', 'user-123', { sessionDuration: 1800 });
   * ```
   */
  async trackAuth(authType: 'login' | 'register' | 'logout', userId: string, properties: Record<string, any> = {}): Promise<ApiResponse<boolean>> {
    // Update the userId for future events
    if (authType === 'login' || authType === 'register') {
      this.setUserId(userId);
    } else if (authType === 'logout') {
      this.setUserId(null);
    }
    
    return this.trackEvent({
      eventName: `auth_${authType}`,
      userId,
      properties
    });
  }
  
  /**
   * Set the user ID for tracking
   * 
   * Associates all future events with the specified user ID.
   * Call this method after a user logs in or is identified.
   * Pass null to clear the user ID (e.g., after logout).
   * 
   * @param userId - The unique identifier for the user, or null to clear
   * 
   * @example
   * ```typescript
   * // After user login
   * analytics.setUserId('user-abc-123');
   * 
   * // After user logout
   * analytics.setUserId(null);
   * ```
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
  }
  
  /**
   * Generate a unique session ID
   * 
   * Creates a unique identifier for the current user session.
   * This is used to group related events together in analytics.
   * 
   * @returns A unique session identifier string
   * @private
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  /**
   * Collect device information
   * 
   * Gathers information about the user's device, browser, operating system,
   * and other relevant environmental factors to provide context for analytics events.
   * Automatically detects platform (web, iOS, Android) and includes appropriate details.
   * 
   * @returns A record containing device and environment information
   * @private
   */
  private collectDeviceInfo(): Record<string, any> {
    const deviceInfo: Record<string, any> = {
      platform: this.getPlatform(),
      timestamp: new Date().toISOString()
    };
    
    // Web-specific info
    if (isWeb() && typeof window !== 'undefined') {
      deviceInfo.userAgent = navigator.userAgent;
      deviceInfo.language = navigator.language;
      deviceInfo.viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      deviceInfo.screenSize = {
        width: window.screen.width,
        height: window.screen.height
      };
      deviceInfo.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    
    return deviceInfo;
  }
  
  /**
   * Get the current platform
   * 
   * Detects whether the code is running on web, iOS, or Android.
   * Uses platform detection utilities from the core package.
   * 
   * @returns A string identifying the platform: 'web', 'ios', or 'android'
   * @private
   */
  private getPlatform(): string {
    if (isWeb()) return 'web';
    if (isIOS()) return 'ios';
    if (isAndroid()) return 'android';
    return 'unknown';
  }
  
  /**
   * Get the current URL (web only)
   * 
   * Retrieves the current page URL when running in a web browser.
   * Returns undefined when running in a non-web environment.
   * 
   * @returns The current URL as a string, or undefined if not available
   * @private
   */
  private getCurrentUrl(): string | undefined {
    if (isWeb() && typeof window !== 'undefined') {
      return window.location.href;
    }
    return undefined;
  }
}
