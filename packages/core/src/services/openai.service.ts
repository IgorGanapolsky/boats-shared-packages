/**
 * OpenAI service implementation
 * Provides functionality for image analysis and boat comparison
 */

import OpenAI from 'openai';
import { 
  OpenAIServiceConfig, 
  OpenAIServiceInterface, 
  OPENAI_ERROR_TYPES,
  OpenAIErrorType,
  Boat
} from '@igorganapolsky/boats-types';

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Create a structured error with additional information
 */
const createOpenAIError = (
  message: string, 
  type: OpenAIErrorType = OPENAI_ERROR_TYPES.UNKNOWN_ERROR, 
  originalError: Error | null = null
): Error & { type: OpenAIErrorType; originalError: Error | null } => {
  const error = new Error(message) as Error & { type: OpenAIErrorType; originalError: Error | null };
  error.type = type;
  error.originalError = originalError;
  return error;
};

/**
 * Analyzes the type of error from OpenAI response
 */
const getErrorType = (error: any): OpenAIErrorType => {
  const message = error?.message?.toLowerCase() || '';
  const status = error?.response?.status;

  if (message.includes('rate limit') || status === 429) {
    return OPENAI_ERROR_TYPES.RATE_LIMIT_ERROR;
  }

  if (message.includes('timeout') || message.includes('timed out')) {
    return OPENAI_ERROR_TYPES.TIMEOUT_ERROR;
  }

  if (message.includes('api key') || message.includes('authentication') || status === 401) {
    return OPENAI_ERROR_TYPES.AUTH_ERROR;
  }

  if (status >= 400 && status < 500) {
    return OPENAI_ERROR_TYPES.INVALID_REQUEST;
  }

  if (status >= 500) {
    return OPENAI_ERROR_TYPES.SERVER_ERROR;
  }

  if (message.includes('network') || message.includes('connection')) {
    return OPENAI_ERROR_TYPES.CONNECTION_ERROR;
  }

  return OPENAI_ERROR_TYPES.UNKNOWN_ERROR;
};

/**
 * OpenAI service for boat image analysis and comparison
 * Implements the OpenAIServiceInterface for usage across platforms
 */
export class OpenAIService implements OpenAIServiceInterface {
  private openai: OpenAI;
  
  constructor(config: OpenAIServiceConfig) {
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: config.dangerouslyAllowBrowser || false,
      baseURL: config.baseURL,
      organization: config.organization
    });
  }

  /**
   * Helper function to implement retry logic with exponential backoff
   */
  private async callWithRetry<T>(apiFunction: () => Promise<T>, maxRetries: number = MAX_RETRIES): Promise<T> {
    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiFunction();
      } catch (error: any) {
        lastError = error;
        
        // Determine error type to handle appropriately
        const errorType = getErrorType(error);
        
        // Don't retry if it's an authentication error or bad request
        if (errorType === OPENAI_ERROR_TYPES.AUTH_ERROR || 
            errorType === OPENAI_ERROR_TYPES.INVALID_REQUEST) {
          throw createOpenAIError(
            `OpenAI API error: ${error.message}`,
            errorType,
            error
          );
        }
        
        // Last attempt - throw the error
        if (attempt === maxRetries) {
          throw createOpenAIError(
            `Failed after ${maxRetries} attempts: ${error.message}`,
            errorType,
            error
          );
        }
        
        // Wait before retrying with exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // This should never happen due to the throw in the loop
    throw createOpenAIError('Unexpected error in retry logic');
  }

  /**
   * Analyzes a boat image and returns detailed information
   */
  async analyzeBoatImage(
    file: File, 
    onProgress?: (message: string) => void
  ): Promise<string> {
    if (!file) {
      throw createOpenAIError('No file provided', OPENAI_ERROR_TYPES.INVALID_REQUEST);
    }

    try {
      if (onProgress) onProgress('Converting image to base64...');
      
      const base64Image = await this.fileToBase64(file);
      
      if (onProgress) onProgress('Analyzing image with OpenAI Vision...');
      
      const response = await this.callWithRetry(() => 
        this.openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "system",
              content: "You are a marine expert who specializes in boat identification and analysis. Provide detailed information about any boat images shown to you."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this boat image. Identify the boat type, manufacturer if possible, estimate size, and describe notable features. Also note any distinctive design elements, equipment, or characteristics. Finally, estimate what boating activities this vessel is best suited for."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      );
      
      if (onProgress) onProgress('Analysis complete, processing results...');
      
      return response.choices[0].message.content || '';
    } catch (error: any) {
      console.error('Error in analyzeBoatImage:', error);
      throw createOpenAIError(
        `Failed to analyze image: ${error.message}`,
        getErrorType(error),
        error
      );
    }
  }
  
  /**
   * Convert a file to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Extract style tags from the boat analysis
   */
  extractStyleTags(analysis: string): string[] {
    if (!analysis) return [];
    
    // Extract mentions of style or type
    const stylePatterns = [
      /style:?\s*([^,\.;]*)/i,
      /type:?\s*([^,\.;]*)/i,
      /design:?\s*([^,\.;]*)/i,
      /category:?\s*([^,\.;]*)/i
    ];
    
    const tags: string[] = [];
    
    for (const pattern of stylePatterns) {
      const match = analysis.match(pattern);
      if (match && match[1]?.trim()) {
        // Clean the tag and add if not already included
        const tag = match[1].trim().toLowerCase();
        if (tag && !tags.includes(tag)) {
          tags.push(tag);
        }
      }
    }
    
    return tags;
  }

  /**
   * Compare two boats and provide detailed comparison
   */
  async compareBoats(boat1: Boat, boat2: Boat): Promise<string> {
    try {
      if (!boat1 || !boat2) {
        throw createOpenAIError('Missing boat information for comparison', OPENAI_ERROR_TYPES.INVALID_REQUEST);
      }

      // Format boat data for the prompt
      const boatData1 = JSON.stringify(boat1, null, 2);
      const boatData2 = JSON.stringify(boat2, null, 2);
      
      // Call OpenAI for comparison
      const response = await this.callWithRetry(() => 
        this.openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: "You are a marine expert who specializes in boat comparisons. Provide detailed, fair comparisons between boats with special attention to their differences in features, use cases, and value."
            },
            {
              role: "user",
              content: `Compare these two boats in detail. Focus on their key differences in terms of design, features, size, use cases, and potential advantages of each.\n\nBoat 1:\n${boatData1}\n\nBoat 2:\n${boatData2}`
            }
          ],
          max_tokens: 1500
        })
      );
      
      return response.choices[0].message.content || '';
    } catch (error: any) {
      console.error('Error in compareBoats:', error);
      throw createOpenAIError(
        `Failed to compare boats: ${error.message}`,
        getErrorType(error),
        error
      );
    }
  }
}
