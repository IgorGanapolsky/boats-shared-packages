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
      const model = this.identifyModel(analysisText);
      const estimatedSize = this.estimateBoatSize(analysisText);
      const suitableActivities = this.identifySuitableActivities(analysisText);
      
      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(analysisText);
      
      return {
        boatType,
        manufacturer,
        model,
        estimatedSize: this.formatEstimatedSize(estimatedSize),
        features,
        description: this.generateDescription(analysisText),
        suitableActivities,
        confidenceScore
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Extract features from analysis text
   * @param analysisText The text analysis from OpenAI
   * @returns Array of boat features
   */
  public extractFeatures(analysisText: string): string[] {
    // Common boat features to look for
    const commonFeatures = [
      'cabin', 'flybridge', 'bow thruster', 'stern thruster', 'swim platform',
      'solar panels', 'generator', 'air conditioning', 'heating', 'refrigerator',
      'gps', 'radar', 'autopilot', 'depth sounder', 'fish finder',
      'trolling motor', 'outriggers', 'tower', 'hardtop', 'bimini',
      'anchor windlass', 'live well', 'fish box', 'rod holders', 'sunpad',
      'swim ladder', 'shower', 'head', 'galley', 'berth', 'stateroom'
    ];
    
    // Extract mentioned features
    const features: string[] = [];
    
    commonFeatures.forEach(feature => {
      if (analysisText.toLowerCase().includes(feature.toLowerCase())) {
        // Capitalize first letter of each word
        const formattedFeature = feature
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        features.push(formattedFeature);
      }
    });
    
    // Add additional features based on contextual clues
    if (analysisText.toLowerCase().includes('luxury') || 
        analysisText.toLowerCase().includes('premium')) {
      features.push('Luxury Amenities');
    }
    
    if (analysisText.toLowerCase().includes('family') || 
        analysisText.toLowerCase().includes('comfortable')) {
      features.push('Family-Friendly');
    }
    
    if (analysisText.toLowerCase().includes('offshore') || 
        analysisText.toLowerCase().includes('deep sea')) {
      features.push('Offshore Capable');
    }
    
    return features;
  }
  
  /**
   * Identify boat type from analysis text
   * @param analysisText The text analysis from OpenAI
   * @returns Identified boat type or undefined
   */
  public identifyBoatType(analysisText: string): string | undefined {
    // Common boat types to identify
    const boatTypes = [
      'pontoon', 'deck boat', 'bowrider', 'center console', 'cabin cruiser',
      'express cruiser', 'cuddy cabin', 'catamaran', 'power catamaran', 'sailboat',
      'motor yacht', 'trawler', 'sport fishing', 'fishing boat', 'bass boat',
      'jet boat', 'personal watercraft', 'runabout', 'tender', 'dinghy',
      'inflatable', 'rigid inflatable', 'jon boat', 'skiff', 'flats boat',
      'console boat', 'dual console', 'walkaround', 'sedan bridge', 'flybridge',
      'convertible', 'express', 'high performance', 'sport boat', 'wakeboard boat',
      'ski boat', 'houseboats'
    ];
    
    // Find the first matching boat type in the analysis
    for (const type of boatTypes) {
      if (analysisText.toLowerCase().includes(type.toLowerCase())) {
        // Capitalize first letter of each word
        return type
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    
    return undefined;
  }
  
  /**
   * Identify manufacturer from analysis text
   * @param analysisText The text analysis from OpenAI
   * @returns Identified manufacturer or undefined
   */
  private identifyManufacturer(analysisText: string): string | undefined {
    // Common boat manufacturers
    const manufacturers = [
      'Sea Ray', 'Bayliner', 'Boston Whaler', 'Chaparral', 'Grady-White',
      'Cobalt', 'MasterCraft', 'Formula', 'Regal', 'Chris-Craft',
      'Pursuit', 'Wellcraft', 'Monterey', 'Scout', 'Robalo',
      'Bertram', 'Hatteras', 'Viking', 'Tiara', 'Carver',
      'Cruisers', 'Fountain', 'Malibu', 'Nautique', 'Tige',
      'Tracker', 'Ranger', 'Lund', 'Crestliner', 'Four Winns',
      'Harris', 'Bennington', 'Sylvan', 'Hurricane', 'Starcraft',
      'Yamaha', 'Carolina Skiff', 'Parker', 'Everglades', 'Jupiter',
      'Intrepid', 'Yellowfin', 'Contender', 'Mako', 'Regulator'
    ];
    
    // Regular expression to try to find mentions of manufacturers
    // Breaking up the regex to reduce complexity
    const prefixes = '(manufactured by|made by|from|by|appears to be a|looks like a)';
    const options = manufacturers.join('|');
    const manufacturerRegex = new RegExp(`${prefixes} (${options})`, 'i');
    const match = manufacturerRegex.exec(analysisText);
    
    if (match?.[2]) {
      return match[2].trim();
    }
    
    // If regex didn't work, try simple inclusion
    for (const manufacturer of manufacturers) {
      if (analysisText.includes(manufacturer)) {
        return manufacturer;
      }
    }
    
    return undefined;
  }
  
  /**
   * Identify model from analysis text
   * @param analysisText The text analysis from OpenAI
   * @returns Identified model or undefined
   */
  private identifyModel(analysisText: string): string | undefined {
    // This is harder to extract generically since models are manufacturer-specific
    // Try to find model numbers (e.g., "280", "Sundancer 320")
    // Simplified model regex to reduce complexity
    const modelRegex = /model (\w+[\s-]?\d+)|(\w+[\s-]?\d+) model/i;
    const match = modelRegex.exec(analysisText);
    
    if (match) {
      // Return the first non-undefined group
      for (let i = 1; i < match.length; i++) {
        if (match[i]) {
          return match[i].trim();
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * Estimate boat size from analysis text
   * @param analysisText The text analysis from OpenAI
   * @returns Estimated dimensions
   */
  public estimateBoatSize(analysisText: string): { length?: number; beam?: number; draft?: number } {
    const dimensions = {
      length: undefined as number | undefined,
      beam: undefined as number | undefined,
      draft: undefined as number | undefined
    };
    
    // Look for length mentions
    const lengthRegex = /(\d+(?:\.\d+)?)\s*(?:foot|feet|ft|')/i;
    const lengthMatch = lengthRegex.exec(analysisText);
    
    if (lengthMatch?.[1]) {
      dimensions.length = parseFloat(lengthMatch[1]);
    }
    
    // Look for beam mentions
    const beamRegex = /beam(?:\s+of)?\s+(\d+(?:\.\d+)?)\s*(?:foot|feet|ft|')/i;
    const beamMatch = beamRegex.exec(analysisText);
    
    if (beamMatch?.[1]) {
      dimensions.beam = parseFloat(beamMatch[1]);
    }
    
    // Look for draft mentions
    const draftRegex = /draft(?:\s+of)?\s+(\d+(?:\.\d+)?)\s*(?:foot|feet|ft|')/i;
    const draftMatch = draftRegex.exec(analysisText);
    
    if (draftMatch?.[1]) {
      dimensions.draft = parseFloat(draftMatch[1]);
    }
    
    return dimensions;
  }
  
  /**
   * Identify suitable activities for the boat
   * @param analysisText The text analysis from OpenAI
   * @returns Array of suitable activities
   */
  private identifySuitableActivities(analysisText: string): string[] {
    // Common boat activities
    const activities = [
      'fishing', 'cruising', 'watersports', 'water skiing', 'wakeboarding',
      'tubing', 'diving', 'snorkeling', 'entertaining', 'day trips',
      'overnight stays', 'coastal cruising', 'offshore boating', 'racing',
      'sailing', 'family outings', 'relaxing', 'swimming'
    ];
    
    // Extract mentioned activities
    const suitableActivities: string[] = [];
    
    activities.forEach(activity => {
      if (analysisText.toLowerCase().includes(activity.toLowerCase())) {
        // Capitalize first letter of each word
        const formattedActivity = activity
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        suitableActivities.push(formattedActivity);
      }
    });
    
    // If no activities were found, add some generic ones based on boat type
    if (suitableActivities.length === 0) {
      const boatType = this.identifyBoatType(analysisText)?.toLowerCase();
      
      if (boatType?.includes('fish') || boatType?.includes('center console') || boatType?.includes('skiff')) {
        suitableActivities.push('Fishing');
      }
      
      if (boatType?.includes('cruise') || boatType?.includes('yacht')) {
        suitableActivities.push('Cruising');
        suitableActivities.push('Entertaining');
      }
      
      if (boatType?.includes('ski') || boatType?.includes('wake')) {
        suitableActivities.push('Watersports');
      }
      
      if (boatType?.includes('pontoon') || boatType?.includes('deck')) {
        suitableActivities.push('Family Outings');
        suitableActivities.push('Relaxing');
      }
      
      // Add a generic activity if still empty
      if (suitableActivities.length === 0) {
        suitableActivities.push('Boating');
      }
    }
    
    return suitableActivities;
  }
  
  /**
   * Generate a concise description from analysis text
   * @param analysisText The text analysis from OpenAI
   * @returns Concise description
   */
  private generateDescription(analysisText: string): string {
    // Use the first 2-3 sentences of the analysis for a concise description
    const sentences = analysisText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 3) {
      return sentences.join('. ') + '.';
    } else {
      return sentences.slice(0, 3).join('. ') + '.';
    }
  }
  
  /**
   * Calculate confidence score based on detail level of analysis
   * @param analysisText The text analysis from OpenAI
   * @returns Confidence score between 0 and 1
   */
  /**
   * Format the estimated size in a readable way without nested template literals
   * @param estimatedSize The size dimensions object
   * @returns Formatted size string
   */
  private formatEstimatedSize(estimatedSize: { length?: number; beam?: number; draft?: number }): string {
    const lengthText = estimatedSize.length ? `${estimatedSize.length} ft` : 'Unknown';
    let sizeText = `${lengthText} length`;
    
    if (estimatedSize.beam) {
      sizeText += ` x ${estimatedSize.beam} ft beam`;
    }
    
    if (estimatedSize.draft) {
      sizeText += ` x ${estimatedSize.draft} ft draft`;
    }
    
    return sizeText;
  }
  
  /**
   * Calculate confidence score based on detail level of analysis
   * @param analysisText The text analysis from OpenAI
   * @returns Confidence score between 0 and 1
   */
  private calculateConfidenceScore(analysisText: string): number {
    let score = 0.5; // Start with a neutral score
    
    // Higher score for longer, more detailed analysis
    if (analysisText.length > 500) score += 0.1;
    if (analysisText.length > 1000) score += 0.1;
    
    // Higher score for specific details
    if (this.identifyBoatType(analysisText)) score += 0.1;
    if (this.identifyManufacturer(analysisText)) score += 0.1;
    if (this.identifyModel(analysisText)) score += 0.1;
    
    const features = this.extractFeatures(analysisText);
    if (features.length > 3) score += 0.05;
    if (features.length > 7) score += 0.05;
    
    // Cap the score at 1.0
    return Math.min(score, 1.0);
  }
}

// Export singleton instance 
export const imageAnalysisService = new ImageAnalysisService();
