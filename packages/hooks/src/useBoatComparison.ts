/**
 * @file Hook for comparing boats using the OpenAI and TensorFlow services.
 * @module boats-hooks/useBoatComparison
 * @description This hook provides a React interface for the boat comparison service,
 * with options for using different AI models and caching results.
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  OpenAIService, 
  TensorFlowService,
  getEnvironmentConfig
} from '@igorganapolsky/boats-core';
import { 
  Boat,
  BoatComparisonResult,
  OpenAIServiceConfig
} from '@igorganapolsky/boats-types';

/**
 * Query key for caching comparison results in React Query
 */
const BOAT_COMPARISON_KEY = 'boatComparison';

/**
 * Options for configuring the boat comparison hook
 */
interface UseBoatComparisonOptions {
  openAIConfig?: OpenAIServiceConfig;
  onComparisonComplete?: (result: BoatComparisonResult) => void;
  onError?: (error: Error) => void;
}

/**
 * State object for tracking boat comparison status
 */
interface ComparisonState {
  isComparing: boolean;
  progress: string;
  error: Error | null;
  result: BoatComparisonResult | null;
}

/**
 * Hook for comparing boats
 * Can be used in both web and mobile applications
 */
export function useBoatComparison(options: UseBoatComparisonOptions = {}) {
  const { 
    openAIConfig = {},
    onComparisonComplete,
    onError
  } = options;
  
  // Get environment configuration
  const envConfig = getEnvironmentConfig();
  
  // Initialize services
  const openAIService = new OpenAIService({
    apiKey: openAIConfig.apiKey || envConfig.openAiApiKey,
    dangerouslyAllowBrowser: true, // For client-side usage
    ...openAIConfig
  });
  
  const tensorflowService = new TensorFlowService();
  
  // State for tracking comparison progress
  const [comparisonState, setComparisonState] = useState({
    isComparing: false,
    progress: '',
    error: null,
    result: null
  });
  
  // Track selected boats for caching
  const [selectedBoats, setSelectedBoats] = useState([null, null] as [Boat | null, Boat | null]);
  
  // Calculate a cache key for the selected boats
  const boatCacheKey = useCallback((boat1?: Boat | null, boat2?: Boat | null): string => {
    if (!boat1 || !boat2) return '';
    return `${boat1.id || ''}_${boat2.id || ''}`;
  }, []);
  
  // Query for getting cached comparison results
  const { data: cachedComparison } = useQuery<BoatComparisonResult | undefined>({
    queryKey: [BOAT_COMPARISON_KEY, boatCacheKey(selectedBoats[0], selectedBoats[1])],
    enabled: !!selectedBoats[0] && !!selectedBoats[1], // Only run if we have two boats selected
    staleTime: 1000 * 60 * 30, // Consider results stale after 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: false
  });
  
  // Mutation for comparing boats
  const { mutateAsync: compareBoats } = useMutation<BoatComparisonResult, Error, [Boat, Boat]>({
    mutationFn: async (boats: [Boat, Boat]): Promise<BoatComparisonResult> => {
      const [boat1, boat2] = boats;
      
      if (!boat1 || !boat2) {
        throw new Error('Two boats are required for comparison');
      }
      
      setSelectedBoats([boat1, boat2] as [Boat | null, Boat | null]);
      setComparisonState((prev: ComparisonState) => ({
        ...prev,
        isComparing: true,
        progress: 'Starting comparison...',
        error: null
      }));
      
      try {
        // Step 1: Get image similarity if both boats have images
        let similarityScore: number | undefined;
        
        if (envConfig.tensorflowEnabled && 
            boat1.imageUrls?.length && 
            boat2.imageUrls?.length) {
          setComparisonState((prev: ComparisonState) => ({
            ...prev,
            progress: 'Analyzing visual similarities...'
          }));
          
          await tensorflowService.loadModel();
          
          // Get the primary images for each boat
          const boat1Image = boat1.primaryImageUrl || boat1.imageUrls[0];
          const boat2Image = boat2.primaryImageUrl || boat2.imageUrls[0];
          
          // Calculate image similarity
          similarityScore = await tensorflowService.compareImages(boat1Image, boat2Image);
        }
        
        // Step 2: Use OpenAI for a natural language comparison
        setComparisonState((prev: ComparisonState) => ({
          ...prev,
          progress: 'Generating detailed comparison...'
        }));
        
        const comparisonText = await openAIService.compareBoats(boat1, boat2);
        
        // Step 3: Process the comparison text to find key points
        setComparisonState((prev: ComparisonState) => ({
          ...prev,
          progress: 'Extracting comparison insights...'
        }));
        
        // Parse similarities and differences from the comparison text
        const similarities = extractSimilarities(comparisonText);
        const differences = extractDifferences(comparisonText);
        const recommendation = extractRecommendation(comparisonText);
        
        // Create the final result
        const result: BoatComparisonResult = {
          boat1,
          boat2,
          similarities,
          differences,
          recommendation,
          similarityScore,
          comparisonText
        };
        
        // Update state with the result
        setComparisonState((prev: ComparisonState) => ({
          ...prev,
          isComparing: false,
          progress: 'Comparison complete',
          result
        }));
        
        // Call onComparisonComplete callback if provided
        if (onComparisonComplete) {
          onComparisonComplete(result);
        }
        
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setComparisonState((prev: ComparisonState) => ({
          ...prev,
          isComparing: false,
          progress: 'Comparison failed',
          error: errorObj
        }));
        
        if (onError) {
          onError(errorObj);
        }
        
        throw errorObj;
      }
    }
  });
  
  // Helper function to reset comparison state
  const resetComparison = useCallback(() => {
    setComparisonState({
      isComparing: false,
      progress: '',
      error: null,
      result: null
    });
    setSelectedBoats([null, null]);
  }, []);
  
  // Helper function to select a boat for comparison
  const selectBoat = useCallback((boat: Boat, position: 0 | 1) => {
    setSelectedBoats((prev: [Boat | null, Boat | null]) => {
      // Create a copy of the array with proper typing
      const newSelection: [Boat | null, Boat | null] = [prev[0], prev[1]];
      newSelection[position] = boat;
      return newSelection;
    });
  }, []);
  
  return {
    compareBoats,
    resetComparison,
    selectBoat,
    selectedBoats,
    ...comparisonState,
    // Return cached comparison if available
    result: comparisonState.result || cachedComparison || null
  };
}

/**
 * Helper functions to extract structured information from the AI-generated comparison text
 * @internal These functions are used internally by the hook
 */

/**
 * Extract similarity statements from the AI-generated comparison text
 * @param text - The AI-generated comparison text
 * @returns Array of similarity statements
 */
function extractSimilarities(text: string): string[] {
  const similarities: string[] = [];
  
  // Look for sections about similarities
  // Find similarities section using regex patterns
  let similaritiesSection: string | undefined;
  const similaritiesRegex = /similarities:?\s*([\s\S]*?)(?=differences:|advantages:|recommendation:|$)/i;
  const bothBoatsRegex = /both boats:?\s*([\s\S]*?)(?=differences:|advantages:|recommendation:|$)/i;
  const commonFeaturesRegex = /common features:?\s*([\s\S]*?)(?=differences:|advantages:|recommendation:|$)/i;
  
  const match1 = similaritiesRegex.exec(text);
  similaritiesSection = match1?.[1];
  
  if (!similaritiesSection) {
    const match2 = bothBoatsRegex.exec(text);
    similaritiesSection = match2?.[1];
  }
  
  if (!similaritiesSection) {
    const match3 = commonFeaturesRegex.exec(text);
    similaritiesSection = match3?.[1];
  }
  
  if (similaritiesSection) {
    // Split by bullet points, numbers, or new lines
    const points = similaritiesSection
      .split(/\n|-|\d+\./)
      .map(point => point.trim())
      .filter(point => point.length > 10); // Filter out very short points
    
    similarities.push(...points);
  }
  
  return similarities;
}

/**
 * Extract difference statements from the AI-generated comparison text
 * @param text - The AI-generated comparison text
 * @returns Array of difference statements
 */
function extractDifferences(text: string): string[] {
  const differences: string[] = [];
  
  // Look for sections about differences
  // Find differences section using regex patterns
  let differencesSection: string | undefined;
  const differencesRegex = /differences:?\s*([\s\S]*?)(?=similarities:|advantages:|recommendation:|$)/i;
  const keyDifferencesRegex = /key differences:?\s*([\s\S]*?)(?=similarities:|advantages:|recommendation:|$)/i;
  const distinguishingRegex = /distinguishing features:?\s*([\s\S]*?)(?=similarities:|advantages:|recommendation:|$)/i;
  
  const match1 = differencesRegex.exec(text);
  differencesSection = match1?.[1];
  
  if (!differencesSection) {
    const match2 = keyDifferencesRegex.exec(text);
    differencesSection = match2?.[1];
  }
  
  if (!differencesSection) {
    const match3 = distinguishingRegex.exec(text);
    differencesSection = match3?.[1];
  }
  
  if (differencesSection) {
    // Split by bullet points, numbers, or new lines
    const points = differencesSection
      .split(/\n|-|\d+\./)
      .map(point => point.trim())
      .filter(point => point.length > 10); // Filter out very short points
    
    differences.push(...points);
  }
  
  return differences;
}

/**
 * Extract recommendation statement from the AI-generated comparison text
 * @param text - The AI-generated comparison text
 * @returns Recommendation statement or undefined if none found
 */
function extractRecommendation(text: string): string | undefined {
  // Look for recommendation or conclusion section
  // Find recommendation section using regex patterns
  let recommendationSection: string | undefined;
  const recommendationRegex = /recommendation:?\s*([\s\S]*?)(?=similarities:|differences:|conclusion:|$)/i;
  const conclusionRegex = /conclusion:?\s*([\s\S]*?)(?=similarities:|differences:|recommendation:|$)/i;
  const summaryRegex = /summary:?\s*([\s\S]*?)(?=similarities:|differences:|recommendation:|$)/i;
  
  const match1 = recommendationRegex.exec(text);
  recommendationSection = match1?.[1];
  
  if (!recommendationSection) {
    const match2 = conclusionRegex.exec(text);
    recommendationSection = match2?.[1];
  }
  
  if (!recommendationSection) {
    const match3 = summaryRegex.exec(text);
    recommendationSection = match3?.[1];
  }
  
  if (recommendationSection) {
    return recommendationSection.trim();
  }
  
  return undefined;
}
