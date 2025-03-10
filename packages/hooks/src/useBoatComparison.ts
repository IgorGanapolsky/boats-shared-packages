/**
 * Hook for comparing boats using the OpenAI and TensorFlow services
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  OpenAIService, 
  TensorFlowService,
  getEnvironmentConfig
} from '@boats/core';
import { 
  Boat,
  BoatComparisonResult,
  OpenAIServiceConfig
} from '@boats/types';

// Query key for caching
const BOAT_COMPARISON_KEY = 'boatComparison';

interface UseBoatComparisonOptions {
  openAIConfig?: OpenAIServiceConfig;
  onComparisonComplete?: (result: BoatComparisonResult) => void;
  onError?: (error: Error) => void;
}

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
  const [comparisonState, setComparisonState] = useState<ComparisonState>({
    isComparing: false,
    progress: '',
    error: null,
    result: null
  });
  
  // Track selected boats for caching
  const [selectedBoats, setSelectedBoats] = useState<[Boat | null, Boat | null]>([null, null]);
  
  // Calculate a cache key for the selected boats
  const boatCacheKey = useCallback((boat1?: Boat | null, boat2?: Boat | null): string => {
    if (!boat1 || !boat2) return '';
    return `${boat1.id || ''}_${boat2.id || ''}`;
  }, []);
  
  // Query for getting cached comparison results
  const { data: cachedComparison } = useQuery({
    queryKey: [BOAT_COMPARISON_KEY, boatCacheKey(selectedBoats[0], selectedBoats[1])],
    enabled: !!selectedBoats[0] && !!selectedBoats[1], // Only run if we have two boats selected
    staleTime: 1000 * 60 * 30, // Consider results stale after 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: false
  });
  
  // Mutation for comparing boats
  const { mutateAsync: compareBoats } = useMutation({
    mutationFn: async (boats: [Boat, Boat]): Promise<BoatComparisonResult> => {
      const [boat1, boat2] = boats;
      
      if (!boat1 || !boat2) {
        throw new Error('Two boats are required for comparison');
      }
      
      setSelectedBoats([boat1, boat2]);
      setComparisonState(prev => ({
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
          setComparisonState(prev => ({
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
        setComparisonState(prev => ({
          ...prev,
          progress: 'Generating detailed comparison...'
        }));
        
        const comparisonText = await openAIService.compareBoats(boat1, boat2);
        
        // Step 3: Process the comparison text to find key points
        setComparisonState(prev => ({
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
        setComparisonState(prev => ({
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
        setComparisonState(prev => ({
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
    setSelectedBoats(prev => {
      const newSelection: [Boat | null, Boat | null] = [...prev];
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

// Helper functions to extract information from the comparison text

function extractSimilarities(text: string): string[] {
  const similarities: string[] = [];
  
  // Look for sections about similarities
  const similaritiesSection = 
    text.match(/similarities:?\s*([\s\S]*?)(?=differences:|advantages:|recommendation:|$)/i)?.[1] ||
    text.match(/both boats:?\s*([\s\S]*?)(?=differences:|advantages:|recommendation:|$)/i)?.[1] ||
    text.match(/common features:?\s*([\s\S]*?)(?=differences:|advantages:|recommendation:|$)/i)?.[1];
  
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

function extractDifferences(text: string): string[] {
  const differences: string[] = [];
  
  // Look for sections about differences
  const differencesSection = 
    text.match(/differences:?\s*([\s\S]*?)(?=similarities:|advantages:|recommendation:|$)/i)?.[1] ||
    text.match(/key differences:?\s*([\s\S]*?)(?=similarities:|advantages:|recommendation:|$)/i)?.[1] ||
    text.match(/distinguishing features:?\s*([\s\S]*?)(?=similarities:|advantages:|recommendation:|$)/i)?.[1];
  
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

function extractRecommendation(text: string): string | undefined {
  // Look for recommendation or conclusion section
  const recommendationSection = 
    text.match(/recommendation:?\s*([\s\S]*?)(?=similarities:|differences:|conclusion:|$)/i)?.[1] ||
    text.match(/conclusion:?\s*([\s\S]*?)(?=similarities:|differences:|recommendation:|$)/i)?.[1] ||
    text.match(/summary:?\s*([\s\S]*?)(?=similarities:|differences:|recommendation:|$)/i)?.[1];
  
  if (recommendationSection) {
    return recommendationSection.trim();
  }
  
  return undefined;
}
