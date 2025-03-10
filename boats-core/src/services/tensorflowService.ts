import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// Initialize variables to store models
let mobileNetModel: mobilenet.MobileNet | null = null;
const modelLoading = { isLoading: false };
let modelLoadPromise: Promise<mobilenet.MobileNet> | null = null;

// Cache for image features to avoid reprocessing
const imageFeatureCache = new Map<string, Float32Array>();

/**
 * Loads the MobileNet model for feature extraction
 * @returns {Promise<mobilenet.MobileNet>} - The loaded MobileNet model
 */
export const loadModel = async (): Promise<mobilenet.MobileNet> => {
    console.log('TensorFlow backend:', tf.getBackend());
    
    if (mobileNetModel) {
        return mobileNetModel;
    }

    if (modelLoadPromise) {
        return modelLoadPromise;
    }

    try {
        modelLoading.isLoading = true;
        // Create a promise that can be reused if multiple calls happen during loading
        modelLoadPromise = mobilenet.load({
            version: 2,
            alpha: 1.0
        });

        mobileNetModel = await modelLoadPromise;
        console.log('✓ MobileNet model loaded successfully');
        return mobileNetModel;
    } catch (error) {
        console.error('Error loading MobileNet model:', error);
        modelLoadPromise = null;
        throw error;
    } finally {
        modelLoading.isLoading = false;
    }
};

/**
 * Converts an image URL to an HTML Image element
 * @param {string} url - The URL of the image
 * @returns {Promise<HTMLImageElement>} - The loaded image element
 */
const urlToImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));
        img.src = url;
    });
};

/**
 * Extracts features from an image using MobileNet
 * @param {string} imageUrl - The URL of the image
 * @returns {Promise<Float32Array>} - Feature vector for the image
 */
export const extractImageFeatures = async (imageUrl: string): Promise<Float32Array> => {
    // Check if we have cached features for this image
    if (imageFeatureCache.has(imageUrl)) {
        return imageFeatureCache.get(imageUrl)!;
    }

    try {
        // Load the model if needed
        const model = await loadModel();
        
        // Prepare the image
        const img = await urlToImage(imageUrl);
        
        // Extract embeddings (feature vectors)
        const activation = await model.infer(img, {
            embedding: true
        }) as tf.Tensor;
        
        // Convert to regular array and store in cache
        const features = await activation.data() as Float32Array;
        
        // Clean up tensor to prevent memory leaks
        activation.dispose();
        
        // Cache the result
        imageFeatureCache.set(imageUrl, features);
        
        return features;
    } catch (error) {
        console.error('Error extracting image features:', error);
        throw error;
    }
};

/**
 * Calculates cosine similarity between two feature vectors
 * @param {Float32Array} features1 - First feature vector
 * @param {Float32Array} features2 - Second feature vector
 * @returns {number} - Similarity score from 0 to 1
 */
export const calculateCosineSimilarity = (features1: Float32Array, features2: Float32Array): number => {
    if (!features1 || !features2) {
        throw new Error('Feature vectors must be provided');
    }
    
    if (features1.length !== features2.length) {
        throw new Error(`Feature vectors have different dimensions: ${features1.length} vs ${features2.length}`);
    }
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    // Calculate dot product and magnitudes
    for (let i = 0; i < features1.length; i++) {
        dotProduct += features1[i] * features2[i];
        magnitude1 += features1[i] * features1[i];
        magnitude2 += features2[i] * features2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    // Avoid division by zero
    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0;
    }
    
    // Return cosine similarity (0 to 1)
    return dotProduct / (magnitude1 * magnitude2);
};

/**
 * Compares two images and returns a similarity score
 * @param {string} imageUrl1 - URL of the first image
 * @param {string} imageUrl2 - URL of the second image
 * @returns {Promise<number>} - Similarity score from 0 to 100
 */
export const compareImages = async (imageUrl1: string, imageUrl2: string): Promise<number> => {
    try {
        // Extract features for both images
        const features1 = await extractImageFeatures(imageUrl1);
        const features2 = await extractImageFeatures(imageUrl2);
        
        // Calculate similarity
        const similarity = calculateCosineSimilarity(features1, features2);
        
        // Convert to percentage (0-100)
        return Math.round(similarity * 100);
    } catch (error) {
        console.error('Error comparing images:', error);
        throw error;
    }
};

/**
 * Calculates the distance between two feature vectors
 * @param {Float32Array} features1 - First feature vector
 * @param {Float32Array} features2 - Second feature vector
 * @returns {number} - Euclidean distance between the vectors
 */
export const calculateEuclideanDistance = (features1: Float32Array, features2: Float32Array): number => {
    if (!features1 || !features2) {
        throw new Error('Feature vectors must be provided');
    }
    
    if (features1.length !== features2.length) {
        throw new Error(`Feature vectors have different dimensions: ${features1.length} vs ${features2.length}`);
    }
    
    let sumSquaredDifferences = 0;
    
    for (let i = 0; i < features1.length; i++) {
        const diff = features1[i] - features2[i];
        sumSquaredDifferences += diff * diff;
    }
    
    return Math.sqrt(sumSquaredDifferences);
};

/**
 * Normalizes a score to a 0-100 range based on a maximum possible distance
 * @param {number} distance - Euclidean distance between feature vectors
 * @returns {number} - Normalized similarity score (0-100)
 */
export const normalizeScore = (distance: number): number => {
    // Maximum possible Euclidean distance for normalized feature vectors
    const maxDistance = Math.sqrt(2);
    
    // Invert and normalize to 0-100 range (closer = higher score)
    const normalizedScore = 100 * (1 - (distance / maxDistance));
    
    return Math.max(0, Math.min(100, normalizedScore));
};

/**
 * Clear the feature cache to free memory
 */
export const clearFeatureCache = (): void => {
    imageFeatureCache.clear();
    console.log('Image feature cache cleared');
};
