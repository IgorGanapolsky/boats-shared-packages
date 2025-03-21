/**
 * Service for analyzing boat images
 * This service provides methods for extracting information from boat images
 */

import { ImageAnalysisResult } from '../types';

/**
 * Image Analysis Service implementation
 */
export class ImageAnalysisService {
  private readonly openAiService: any; // Will be properly typed when imported
  private readonly tensorflowService: any; // Will be properly typed when imported
  
  /**
   * Initialize the image analysis service
   * @param openAiService Service for OpenAI integrations
   * @param tensorflowService Service for TensorFlow operations
   */
  constructor(openAiService?: any, tensorflowService?: any) {
    this.openAiService = openAiService;
    this.tensorflowService = tensorflowService;
  }
  
  /**
   * Analyze a boat image to extract information
   * @param imageFile The image file to analyze
   * @param onProgress Optional callback for progress updates
   * @returns Analysis results containing boat information
   */
  public async analyzeImage(
    imageFile: File,
    onProgress?: (message: string) => void
  ): Promise<ImageAnalysisResult> {
    try {
      // Report progress if callback provided
      if (onProgress) {
        onProgress('Starting image analysis...');
      }
      
      // First use OpenAI to get a detailed description
      if (onProgress) {
        onProgress('Generating detailed description...');
      }
      
      const analysisText = await this.openAiService.analyzeBoatImage(
        imageFile,
        onProgress
      );
      
      // Extract structured information from the analysis text
      if (onProgress) {
        onProgress('Extracting boat details from analysis...');
      }
      
      // Extract features from the description
      const features = this.extractFeatures(analysisText);
      
      // Identify boat type and characteristics
      const boatType = this.identifyBoatType(analysisText);
      const manufacturer = this.identifyManufacturer(analysisText);
      
      // Identify additional attributes
      const year = this.extractYear(analysisText);
      const length = this.extractLength(analysisText);
      
      return {
        boatType,
        manufacturer,
        year,
        length,
        features,
        confidence: 0.85, // Default confidence
        rawAnalysis: analysisText
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      // Return basic result with error
      return {
        boatType: 'unknown',
        manufacturer: 'unknown',
        year: 0,
        length: 0,
        features: [],
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        rawAnalysis: ''
      };
    }
  }
  
  // Helper methods to extract information from analysis text
  private extractFeatures(text: string): string[] {
    // Simple extraction based on commas and bullet points
    return text
      .split(/[,•\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 3 && item.length < 50);
  }
  
  private identifyBoatType(text: string): string {
    const boatTypes = [
      'yacht', 'sailboat', 'motorboat', 'fishing boat', 
      'speedboat', 'pontoon', 'cruiser', 'catamaran'
    ];
    
    for (const type of boatTypes) {
      if (text.toLowerCase().includes(type)) {
        return type;
      }
    }
    
    return 'boat'; // Default if no specific type is found
  }
  
  private identifyManufacturer(text: string): string {
    // This would ideally use a database of manufacturers
    // Simplified implementation for now
    const manufacturers = [
      'Sea Ray', 'Bayliner', 'Boston Whaler', 'Chaparral',
      'Grady-White', 'MasterCraft', 'Chris-Craft', 'Bertram'
    ];
    
    for (const manufacturer of manufacturers) {
      if (text.includes(manufacturer)) {
        return manufacturer;
      }
    }
    
    return 'unknown';
  }
  
  private extractYear(text: string): number {
    // Look for 4-digit years between 1900 and current year
    const currentYear = new Date().getFullYear();
    const yearRegex = /\b(19\d{2}|20\d{2})\b/g;
    const years = text.match(yearRegex);
    
    if (years && years.length > 0) {
      // Find the most likely year (closest to current year)
      const validYears = years
        .map(y => parseInt(y))
        .filter(y => y >= 1900 && y <= currentYear);
      
      if (validYears.length > 0) {
        return validYears.reduce((a, b) => 
          Math.abs(currentYear - a) < Math.abs(currentYear - b) ? a : b
        );
      }
    }
    
    return 0;
  }
  
  private extractLength(text: string): number {
    // Look for patterns like "XX feet", "XX ft", "XX'"
    const lengthRegex = /\b(\d{1,3})(?:\s*(?:feet|foot|ft|'))/i;
    const match = text.match(lengthRegex);
    
    if (match && match[1]) {
      return parseInt(match[1]);
    }
    
    return 0;
  }
}

/**
 * Standalone function for analyzing boat images - for React Native compatibility
 * @param base64Image Base64 encoded image to analyze
 * @returns Analysis results with boat features
 */
export const analyzeBoatImage = async (base64Image: string): Promise<any> => {
  try {
    // This is a simplified implementation for React Native
    // In a real implementation, this would connect to OpenAI API
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock analysis results (this would normally come from AI)
    return {
      boatType: 'yacht',
      confidence: 0.85,
      features: [
        'White hull',
        'Two decks', 
        'Flybridge',
        'Hull windows',
        'Swim platform',
        'Radar dome'
      ],
      dimensions: {
        length: '42ft',
        beam: '14ft',
        draft: '3.5ft'
      },
      manufacturer: 'Sample Manufacturer',
      year: 2022,
      estimatedValue: '$550,000 - $650,000'
    };
  } catch (error) {
    console.error('Error analyzing boat image:', error);
    return {
      boatType: 'unknown',
      confidence: 0,
      features: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Export singleton instance 
export const imageAnalysisService = new ImageAnalysisService();
