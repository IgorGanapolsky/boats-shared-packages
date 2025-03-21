/**
 * Boat API client
 * Provides methods for interacting with boat data
 */

import { 
  get, 
  post, 
  put, 
  del, 
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
      const url = `${this.config.apiUrl}/boats`;
      const response = await get<Boat[]>(url, params);
      return { data: response, error: null };
    } catch (error) {
      return handleApiError<Boat[]>(error, 'Failed to fetch boats');
    }
  }
  
  /**
   * Get a single boat by ID
   */
  async getBoat(id: string): Promise<ApiResponse<Boat>> {
    try {
      const url = `${this.config.apiUrl}/boats/${id}`;
      const response = await get<Boat>(url);
      return { data: response, error: null };
    } catch (error) {
      return handleApiError<Boat>(error, `Failed to fetch boat with ID: ${id}`);
    }
  }
  
  /**
   * Create a new boat
   */
  async createBoat(boat: Partial<Boat>): Promise<ApiResponse<Boat>> {
    try {
      const url = `${this.config.apiUrl}/boats`;
      const response = await post<Boat>(url, boat);
      return { data: response, error: null };
    } catch (error) {
      return handleApiError<Boat>(error, 'Failed to create boat');
    }
  }
  
  /**
   * Update an existing boat
   */
  async updateBoat(id: string, boat: Partial<Boat>): Promise<ApiResponse<Boat>> {
    try {
      const url = `${this.config.apiUrl}/boats/${id}`;
      const response = await put<Boat>(url, boat);
      return { data: response, error: null };
    } catch (error) {
      return handleApiError<Boat>(error, `Failed to update boat with ID: ${id}`);
    }
  }
  
  /**
   * Delete a boat
   */
  async deleteBoat(id: string): Promise<ApiResponse<boolean>> {
    try {
      const url = `${this.config.apiUrl}/boats/${id}`;
      await del(url);
      return { data: true, error: null };
    } catch (error) {
      return handleApiError<boolean>(error, `Failed to delete boat with ID: ${id}`);
    }
  }
  
  /**
   * Compare two boats
   */
  async compareBoats(boat1Id: string, boat2Id: string): Promise<ApiResponse<BoatComparisonResult>> {
    try {
      const url = `${this.config.apiUrl}/boats/compare`;
      const response = await post<BoatComparisonResult>(url, { boat1Id, boat2Id });
      return { data: response, error: null };
    } catch (error) {
      return handleApiError<BoatComparisonResult>(error, 'Failed to compare boats');
    }
  }
  
  /**
   * Search for boats by text query
   */
  async searchBoats(query: string): Promise<ApiResponse<Boat[]>> {
    try {
      const params = new URLSearchParams({ q: query });
      const url = `${this.config.apiUrl}/boats/search?${params.toString()}`;
      const response = await get<Boat[]>(url);
      return { data: response, error: null };
    } catch (error) {
      return handleApiError<Boat[]>(error, 'Failed to search boats');
    }
  }
  
  /**
   * Analyze a boat image and return results
   */
  async analyzeImage(imageData: File | Blob): Promise<ApiResponse<ImageAnalysisResult>> {
    try {
      const formData = new FormData();
      formData.append('image', imageData);
      
      const url = `${this.config.apiUrl}/boats/analyze`;
      const response = await post<ImageAnalysisResult>(url, formData);
      return { data: response, error: null };
    } catch (error) {
      return handleApiError<ImageAnalysisResult>(error, 'Failed to analyze image');
    }
  }
  
  /**
   * Find similar boats based on an analysis result
   */
  async findSimilarBoats(analysis: ImageAnalysisResult): Promise<ApiResponse<Boat[]>> {
    try {
      const url = `${this.config.apiUrl}/boats/similar`;
      const response = await post<Boat[]>(url, analysis);
      return { data: response, error: null };
    } catch (error) {
      return handleApiError<Boat[]>(error, 'Failed to find similar boats');
    }
  }
  
  /**
   * Get boat statistics (counts by type, manufacturer, etc.)
   */
  async getBoatStatistics(): Promise<ApiResponse<Record<string, any>>> {
    try {
      const url = `${this.config.apiUrl}/boats/statistics`;
      const response = await get<Record<string, any>>(url);
      return { data: response, error: null };
    } catch (error) {
      return handleApiError<Record<string, any>>(error, 'Failed to get boat statistics');
    }
  }
}

/**
 * Standalone function to get boat details - for React Native compatibility
 * @param id Boat identifier
 * @returns Boat details
 */
export const getBoatDetails = async (id: string): Promise<Boat> => {
  try {
    // In a real implementation, this would connect to the API
    // For now, return mock data for mobile app development
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      id,
      name: `Boat ${id}`,
      type: 'yacht',
      manufacturer: 'Example Manufacturer',
      model: 'Luxury 42',
      year: 2023,
      length: 42,
      beam: 14,
      draft: 4.5,
      price: 550000,
      description: 'A beautiful luxury yacht with modern amenities and excellent condition.',
      features: [
        'Flybridge',
        'Swim Platform',
        'Bow Thruster',
        'Generator',
        'Air Conditioning',
        'Watermaker'
      ],
      specifications: {
        'Engine Type': 'Twin Diesel',
        'Engine Hours': 350,
        'Fuel Capacity': '450 gallons',
        'Water Capacity': '150 gallons',
        'Hull Material': 'Fiberglass',
        'Location': 'Miami, FL'
      },
      images: [
        {
          url: 'https://example.com/boats/yacht1.jpg',
          caption: 'Port side view'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching boat details:', error);
    throw new Error(`Failed to get boat details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Export singleton instance
export const boatApiClient = new BoatApiClient();
