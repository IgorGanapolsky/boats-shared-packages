/**
 * Core domain models and types for the Boats.com application
 */

// Boat Types
export interface BoatBase {
  id: string;
  name: string;
  manufacturer?: string;
  model?: string;
  year?: number;
}

export interface BoatDimensions {
  length?: number;
  beam?: number;
  draft?: number;
  weight?: number; // in pounds/kg
}

export interface BoatFeatures {
  engineType?: string;
  hullType?: string;
  fuelType?: string;
  cabins?: number;
  berths?: number;
  features: string[];
}

export interface BoatMedia {
  imageUrls: string[];
  primaryImageUrl?: string;
  videoUrls?: string[];
}

// Complete Boat model with all properties
export interface Boat extends BoatBase, BoatDimensions, BoatFeatures, BoatMedia {
  description?: string;
  price?: number;
  currency?: string;
  condition?: 'new' | 'used';
  location?: string;
  categoryTags?: string[];
}

// AI Analysis Types
export interface ImageAnalysisResult {
  boatType?: string;
  manufacturer?: string;
  model?: string;
  estimatedSize?: string;
  features: string[];
  description: string;
  suitableActivities: string[];
  confidenceScore?: number;
}

export interface BoatComparisonResult {
  boat1: Boat;
  boat2: Boat;
  similarities: string[];
  differences: string[];
  recommendation?: string;
  similarityScore?: number; // 0-100
  comparisonText?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

// Configuration Types
export interface EnvironmentConfig {
  apiUrl: string;
  openAiApiKey?: string;
  tensorflowEnabled: boolean;
  featureFlags: {
    experimentalFeatures: boolean;
    proMode: boolean;
    debugMode: boolean;
  };
}

// Export all types for use across packages
export * from './services';
export * from './ui';
export * from './state';
export * from './network';
