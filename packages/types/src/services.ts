/**
 * Type definitions for service interfaces
 */

import { Boat, ImageAnalysisResult, BoatComparisonResult } from './index';

// OpenAI Service Types
export interface OpenAIServiceConfig {
  apiKey?: string;
  dangerouslyAllowBrowser?: boolean;
  baseURL?: string;
  organization?: string;
}

export const OPENAI_ERROR_TYPES = {
  CONNECTION_ERROR: 'connection_error',
  RATE_LIMIT_ERROR: 'rate_limit_error',
  TIMEOUT_ERROR: 'timeout_error',
  AUTH_ERROR: 'authentication_error',
  INVALID_REQUEST: 'invalid_request',
  SERVER_ERROR: 'server_error',
  UNKNOWN_ERROR: 'unknown_error'
} as const;

export type OpenAIErrorType = typeof OPENAI_ERROR_TYPES[keyof typeof OPENAI_ERROR_TYPES];

export interface OpenAIServiceInterface {
  analyzeBoatImage(file: File, onProgress?: (message: string) => void): Promise<string>;
  compareBoats(boat1: Boat, boat2: Boat): Promise<string>;
  extractStyleTags(analysis: string): string[];
}

// TensorFlow Service Types
export interface FeatureVector extends Float32Array {}

export interface TensorFlowServiceInterface {
  loadModel(): Promise<any>;
  extractImageFeatures(imageUrl: string): Promise<FeatureVector>;
  compareImages(imageUrl1: string, imageUrl2: string): Promise<number>;
  calculateCosineSimilarity(features1: FeatureVector, features2: FeatureVector): number;
  calculateEuclideanDistance(features1: FeatureVector, features2: FeatureVector): number;
  normalizeScore(distance: number): number;
  clearFeatureCache(): void;
}

// Boat Database Service Types
export interface BoatDatabaseServiceInterface {
  getAllBoats(): Promise<Boat[]>;
  getBoatById(id: string): Promise<Boat | null>;
  saveBoat(boat: Partial<Boat>): Promise<Boat>;
  deleteBoat(id: string): Promise<boolean>;
  searchBoats(query: string): Promise<Boat[]>;
  findSimilarBoats(analysis: ImageAnalysisResult): Promise<Boat[]>;
  compareBoats(boat1Id: string, boat2Id: string): Promise<BoatComparisonResult | null>;
}

// Image Analysis Service Types
export interface ImageAnalysisServiceInterface {
  analyzeImage(file: File, onProgress?: (message: string) => void): Promise<ImageAnalysisResult>;
  extractFeatures(analysis: string): string[];
  identifyBoatType(analysis: string): string;
  estimateBoatSize(analysis: string): { length?: number; beam?: number; draft?: number };
}

// Network types are now in network.ts
