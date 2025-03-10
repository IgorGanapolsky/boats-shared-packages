/**
 * Hook for analyzing boat images using the OpenAI and TensorFlow services
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  OpenAIService, 
  TensorFlowService,
  getEnvironmentConfig
} from '@boats/core';
import { 
  ImageAnalysisResult,
  OpenAIServiceConfig
} from '@boats/types';

// Query key for caching
const IMAGE_ANALYSIS_KEY = 'imageAnalysis';

interface UseImageAnalysisOptions {
  openAIConfig?: OpenAIServiceConfig;
  onAnalysisComplete?: (result: ImageAnalysisResult) => void;
  onError?: (error: Error) => void;
}

interface AnalysisState {
  isAnalyzing: boolean;
  progress: string;
  error: Error | null;
  result: ImageAnalysisResult | null;
}

/**
 * Hook for analyzing boat images
 * Can be used in both web and mobile applications
 */
export function useImageAnalysis(options: UseImageAnalysisOptions = {}) {
  const { 
    openAIConfig = {},
    onAnalysisComplete,
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
  
  // State for tracking analysis progress
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: '',
    error: null,
    result: null
  });
  
  // Store the last analyzed image URL for caching
  const [lastAnalyzedImageUrl, setLastAnalyzedImageUrl] = useState<string | null>(null);
  
  // Query for getting cached analysis results
  const { data: cachedAnalysis } = useQuery({
    queryKey: [IMAGE_ANALYSIS_KEY, lastAnalyzedImageUrl],
    enabled: !!lastAnalyzedImageUrl, // Only run if we have an image URL
    staleTime: 1000 * 60 * 30, // Consider results stale after 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: false
  });
  
  // Mutation for analyzing images
  const { mutateAsync: analyzeImage } = useMutation({
    mutationFn: async (file: File): Promise<ImageAnalysisResult> => {
      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: true,
        progress: 'Starting analysis...',
        error: null
      }));
      
      try {
        // Create object URL for the file to use with TensorFlow
        const imageUrl = URL.createObjectURL(file);
        setLastAnalyzedImageUrl(imageUrl);
        
        // Update progress handler
        const updateProgress = (message: string) => {
          setAnalysisState(prev => ({
            ...prev,
            progress: message
          }));
        };
        
        // Step 1: Get OpenAI analysis
        updateProgress('Analyzing image with AI...');
        const analysisText = await openAIService.analyzeBoatImage(file, updateProgress);
        
        // Step 2: Extract features if TensorFlow is enabled
        let features: string[] = [];
        if (envConfig.tensorflowEnabled) {
          updateProgress('Extracting visual features...');
          await tensorflowService.loadModel();
          await tensorflowService.extractImageFeatures(imageUrl);
          features = openAIService.extractStyleTags(analysisText);
        } else {
          features = openAIService.extractStyleTags(analysisText);
        }
        
        // Parse the analysis text to extract structured information
        updateProgress('Processing analysis results...');
        const result: ImageAnalysisResult = {
          boatType: extractBoatType(analysisText),
          manufacturer: extractManufacturer(analysisText),
          model: extractModel(analysisText),
          estimatedSize: extractSize(analysisText),
          features,
          description: analysisText,
          suitableActivities: extractActivities(analysisText),
          confidenceScore: 0.85 // Placeholder - would ideally be derived from analysis
        };
        
        // Update state with the result
        setAnalysisState(prev => ({
          ...prev,
          isAnalyzing: false,
          progress: 'Analysis complete',
          result
        }));
        
        // Call onComplete callback if provided
        if (onAnalysisComplete) {
          onAnalysisComplete(result);
        }
        
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setAnalysisState(prev => ({
          ...prev,
          isAnalyzing: false,
          progress: 'Analysis failed',
          error: errorObj
        }));
        
        if (onError) {
          onError(errorObj);
        }
        
        throw errorObj;
      }
    }
  });
  
  // Helper function to reset analysis state
  const resetAnalysis = useCallback(() => {
    setAnalysisState({
      isAnalyzing: false,
      progress: '',
      error: null,
      result: null
    });
    setLastAnalyzedImageUrl(null);
  }, []);
  
  return {
    analyzeImage,
    resetAnalysis,
    ...analysisState,
    // Return cached analysis if available
    result: analysisState.result || cachedAnalysis || null
  };
}

// Helper functions to extract information from the analysis text
function extractBoatType(text: string): string | undefined {
  const typePatterns = [
    /boat type:?\s*([^,\.;]*)/i,
    /vessel type:?\s*([^,\.;]*)/i,
    /type of boat:?\s*([^,\.;]*)/i,
    /identified as a:?\s*([^,\.;]*)\s*boat/i
  ];
  
  for (const pattern of typePatterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

function extractManufacturer(text: string): string | undefined {
  const patterns = [
    /manufacturer:?\s*([^,\.;]*)/i,
    /made by:?\s*([^,\.;]*)/i,
    /built by:?\s*([^,\.;]*)/i,
    /brand:?\s*([^,\.;]*)/i
  ];
  
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

function extractModel(text: string): string | undefined {
  const patterns = [
    /model:?\s*([^,\.;]*)/i,
    /model name:?\s*([^,\.;]*)/i,
    /series:?\s*([^,\.;]*)/i
  ];
  
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

function extractSize(text: string): string | undefined {
  const patterns = [
    /size:?\s*([^,\.;]*)/i,
    /length:?\s*([^,\.;]*)/i,
    /approximately\s*([\d\.-]+\s*(?:feet|ft|meters|m))/i,
    /([\d\.-]+\s*(?:feet|ft|meters|m))\s*(?:in length|long)/i
  ];
  
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

function extractActivities(text: string): string[] {
  const activities: string[] = [];
  
  // Common boat activities
  const activityKeywords = [
    'fishing', 'sailing', 'cruising', 'racing', 'watersports', 
    'diving', 'water skiing', 'wakeboarding', 'day trips',
    'offshore', 'coastal', 'recreational', 'sport', 'touring',
    'overnight', 'leisure', 'family', 'professional'
  ];
  
  // Look for sentences about activities or uses
  const activitySection = text.match(/suitable for:?\s*([^\.]*)/i)?.[1] || 
                         text.match(/activities:?\s*([^\.]*)/i)?.[1] || 
                         text.match(/uses:?\s*([^\.]*)/i)?.[1] || 
                         text.match(/ideal for:?\s*([^\.]*)/i)?.[1];
  
  if (activitySection) {
    // Extract comma-separated list if present
    const activityList = activitySection.split(/,|and/).map(a => a.trim().toLowerCase());
    activities.push(...activityList.filter(a => a.length > 3));
  }
  
  // Also check for general keyword mentions
  for (const keyword of activityKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(text) && !activities.includes(keyword)) {
      activities.push(keyword);
    }
  }
  
  return activities.filter(Boolean);
}
