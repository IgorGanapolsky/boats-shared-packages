/**
 * Analytics API client
 * Provides methods for tracking user interactions and events
 * Works across web and mobile platforms
 */

import { 
  post, 
  handleApiError,
  isWeb,
  isIOS,
  isAndroid
} from '@boats/core';
import { ApiResponse } from '@boats/types';
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
  private config: ApiClientConfig;
  private sessionId: string;
  private deviceInfo: Record<string, any>;
  private userId: string | null = null;
  
  constructor(config?: Partial<ApiClientConfig>) {
    this.config = getApiConfig(config);
    this.sessionId = this.generateSessionId();
    this.deviceInfo = this.collectDeviceInfo();
  }
  
  /**
   * Track a user event
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
        success: false,
        data: false,
        message: 'Failed to track event'
      };
    }
  }
  
  /**
   * Track a page view
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
   * Track a boat view
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
   * Track a boat comparison
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
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
  }
  
  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  /**
   * Collect device information
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
   */
  private getPlatform(): string {
    if (isWeb()) return 'web';
    if (isIOS()) return 'ios';
    if (isAndroid()) return 'android';
    return 'unknown';
  }
  
  /**
   * Get the current URL (web only)
   */
  private getCurrentUrl(): string | undefined {
    if (isWeb() && typeof window !== 'undefined') {
      return window.location.href;
    }
    return undefined;
  }
}
