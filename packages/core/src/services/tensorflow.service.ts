/**
 * TensorFlow Service
 * Provides image analysis and feature extraction capabilities using TensorFlow.js
 */

import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { 
  TensorFlowServiceInterface, 
  FeatureVector
} from '@igorganapolsky/boats-types';

export class TensorFlowService implements TensorFlowServiceInterface {
  private model: mobilenet.MobileNet | null = null;
  private featureCache: Map<string, FeatureVector> = new Map();
  
  /**
   * Load the MobileNet model
   */
  async loadModel(): Promise<mobilenet.MobileNet> {
    if (!this.model) {
      // Ensure TensorFlow.js is properly initialized
      await tf.ready();
      this.model = await mobilenet.load({
        version: 2,
        alpha: 1.0,
      });
    }
    return this.model;
  }

  /**
   * Extract feature vector from an image
   * This is the core functionality used for image comparison
   */
  async extractImageFeatures(imageUrl: string): Promise<FeatureVector> {
    // Check cache first
    if (this.featureCache.has(imageUrl)) {
      return this.featureCache.get(imageUrl)!;
    }

    // Load model if not already loaded
    const model = await this.loadModel();
    
    try {
      // Load the image
      const img = await this.loadImageFromUrl(imageUrl);
      
      // Get intermediate activation of MobileNet's penultimate layer
      // This returns a high-dimensional feature vector that represents the image
      const activation = model.infer(img, {
        includeTop: false,
      });
      
      // Convert to a 1D tensor and then a TypedArray
      const flattenedFeatures = tf.squeeze(activation);
      const features = await flattenedFeatures.data() as unknown as FeatureVector;
      
      // Cache the results for future use
      this.featureCache.set(imageUrl, features);
      
      // Clean up to prevent memory leaks
      tf.dispose([activation, flattenedFeatures]);
      img.dispose();
      
      return features;
    } catch (error) {
      console.error('Error extracting image features:', error);
      throw new Error(`Failed to extract features: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Compare two images and return a similarity score between 0 and 1
   * 1 means identical, 0 means completely different
   */
  async compareImages(imageUrl1: string, imageUrl2: string): Promise<number> {
    try {
      // Extract features from both images
      const features1 = await this.extractImageFeatures(imageUrl1);
      const features2 = await this.extractImageFeatures(imageUrl2);
      
      // Calculate similarity using cosine similarity
      return this.calculateCosineSimilarity(features1, features2);
    } catch (error) {
      console.error('Error comparing images:', error);
      throw new Error(`Failed to compare images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate cosine similarity between two feature vectors
   * Returns a value between -1 and 1, where 1 means identical
   */
  calculateCosineSimilarity(features1: FeatureVector, features2: FeatureVector): number {
    if (features1.length !== features2.length) {
      throw new Error('Feature vectors must have the same length');
    }
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (let i = 0; i < features1.length; i++) {
      dotProduct += features1[i] * features2[i];
      magnitude1 += features1[i] * features1[i];
      magnitude2 += features2[i] * features2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }
    
    // Cosine similarity
    const similarity = dotProduct / (magnitude1 * magnitude2);
    
    // Normalize to 0-1 range for clearer interpretation
    return (similarity + 1) / 2;
  }

  /**
   * Calculate Euclidean distance between two feature vectors
   * Lower values indicate more similarity
   */
  calculateEuclideanDistance(features1: FeatureVector, features2: FeatureVector): number {
    if (features1.length !== features2.length) {
      throw new Error('Feature vectors must have the same length');
    }
    
    let sumSquaredDifferences = 0;
    
    for (let i = 0; i < features1.length; i++) {
      const diff = features1[i] - features2[i];
      sumSquaredDifferences += diff * diff;
    }
    
    return Math.sqrt(sumSquaredDifferences);
  }

  /**
   * Convert an Euclidean distance to a normalized similarity score (0-1)
   * where 1 means identical (distance = 0)
   */
  normalizeScore(distance: number): number {
    // Apply exponential decay function to convert distance to similarity
    // This is a common approach in similarity metrics
    return Math.exp(-distance / 100);
  }

  /**
   * Clear the feature cache to free memory
   */
  clearFeatureCache(): void {
    this.featureCache.clear();
  }

  /**
   * Load an image from a URL and convert it to a TensorFlow tensor
   */
  private async loadImageFromUrl(url: string): Promise<tf.Tensor3D> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          // Convert image to tensor
          const tensor = tf.browser.fromPixels(img);
          resolve(tensor);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = (error) => {
        reject(new Error(`Failed to load image from URL: ${url}`));
      };
      
      img.src = url;
    });
  }
}
