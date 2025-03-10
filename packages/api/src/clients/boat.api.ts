/**
 * Boat API client
 * Provides methods for interacting with boat data
 */

import { 
  get, 
  post, 
  put, 
  del, 
  fetchWithTimeout, 
  handleApiError 
} from '@boats/core';
import { 
  Boat, 
  BoatComparisonResult, 
  ImageAnalysisResult, 
  ApiResponse 
} from '@boats/types';
import { ApiClientConfig, getApiConfig } from '../config/api-config';

export class BoatApiClient {
  private config: ApiClientConfig;
  
  constructor(config?: Partial<ApiClientConfig>) {
    this.config = getApiConfig(config);
  }
  
  /**
   * Get all boats with optional filtering
   */
  async getBoats(params?: URLSearchParams): Promise<ApiResponse<Boat[]>> {
    try {
      const queryParams = params ? `?${params.toString()}` : '';
      return await get<ApiResponse<Boat[]>>(
        `${this.config.baseUrl}/boats${queryParams}`,
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
   * Get a single boat by ID
   */
  async getBoatById(id: string): Promise<ApiResponse<Boat>> {
    try {
      return await get<ApiResponse<Boat>>(
        `${this.config.baseUrl}/boats/${id}`,
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
   * Create a new boat
   */
  async createBoat(boat: Partial<Boat>): Promise<ApiResponse<Boat>> {
    try {
      return await post<ApiResponse<Boat>>(
        `${this.config.baseUrl}/boats`,
        boat,
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
   * Update an existing boat
   */
  async updateBoat(id: string, boat: Partial<Boat>): Promise<ApiResponse<Boat>> {
    try {
      return await put<ApiResponse<Boat>>(
        `${this.config.baseUrl}/boats/${id}`,
        boat,
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
   * Delete a boat
   */
  async deleteBoat(id: string): Promise<ApiResponse<boolean>> {
    try {
      return await del<ApiResponse<boolean>>(
        `${this.config.baseUrl}/boats/${id}`,
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
   * Search for boats by text query
   */
  async searchBoats(query: string): Promise<ApiResponse<Boat[]>> {
    try {
      const params = new URLSearchParams({ q: query });
      return await get<ApiResponse<Boat[]>>(
        `${this.config.baseUrl}/boats/search?${params.toString()}`,
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
   * Compare two boats
   */
  async compareBoats(boat1Id: string, boat2Id: string): Promise<ApiResponse<BoatComparisonResult>> {
    try {
      return await get<ApiResponse<BoatComparisonResult>>(
        `${this.config.baseUrl}/boats/compare?boat1=${boat1Id}&boat2=${boat2Id}`,
        { 
          headers: this.config.headers,
          timeout: this.config.timeout * 2 // Longer timeout for comparison
        }
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }
  
  /**
   * Analyze a boat image and return results
   */
  async analyzeImage(imageData: File | Blob): Promise<ApiResponse<ImageAnalysisResult>> {
    try {
      const formData = new FormData();
      formData.append('image', imageData);
      
      return await post<ApiResponse<ImageAnalysisResult>>(
        `${this.config.baseUrl}/boats/analyze`,
        formData,
        { 
          headers: {
            // No Content-Type header for FormData
            ...this.config.headers,
            'Content-Type': undefined
          },
          timeout: this.config.timeout * 2 // Longer timeout for image analysis
        }
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }
  
  /**
   * Find similar boats based on an analysis result
   */
  async findSimilarBoats(analysis: ImageAnalysisResult): Promise<ApiResponse<Boat[]>> {
    try {
      return await post<ApiResponse<Boat[]>>(
        `${this.config.baseUrl}/boats/similar`,
        analysis,
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
   * Get boat statistics (counts by type, manufacturer, etc.)
   */
  async getBoatStatistics(): Promise<ApiResponse<Record<string, any>>> {
    try {
      return await get<ApiResponse<Record<string, any>>>(
        `${this.config.baseUrl}/boats/statistics`,
        { 
          headers: this.config.headers,
          timeout: this.config.timeout
        }
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }
}
