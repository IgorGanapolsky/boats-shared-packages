/**
 * @file Core domain models and types for the Boats.com application.
 * This file exports all the main types used across the Boats.com ecosystem.
 * @packageDocumentation
 */

/**
 * Base interface for boat information with essential properties.
 * Contains the minimum required fields for a boat entity.
 */
export interface BoatBase {
  id: string;
  name: string;
  manufacturer?: string;
  model?: string;
  year?: number;
}

/**
 * Physical dimensions and measurements of a boat.
 * All measurements are typically in standard marine units (feet/meters).
 */
export interface BoatDimensions {
  length?: number;
  beam?: number;
  draft?: number;
  weight?: number; // in pounds/kg
}

/**
 * Optional features and specifications of a boat.
 * These properties describe the boat's capabilities and equipment.
 */
export interface BoatFeatures {
  engineType?: string;
  hullType?: string;
  fuelType?: string;
  cabins?: number;
  berths?: number;
  features: string[];
}

/**
 * Media assets associated with a boat listing.
 * Includes images, videos, and other visual content.
 */
export interface BoatMedia {
  imageUrls: string[];
  primaryImageUrl?: string;
  videoUrls?: string[];
}

/**
 * Complete Boat model that combines all boat-related interfaces.
 * This is the primary type used for boat listings and comparisons.
 * @extends BoatBase - Core boat information
 * @extends BoatDimensions - Physical measurements
 * @extends BoatFeatures - Optional features and equipment
 * @extends BoatMedia - Associated media content
 */
export interface Boat extends BoatBase, BoatDimensions, BoatFeatures, BoatMedia {
  description?: string;
  price?: number;
  currency?: string;
  condition?: 'new' | 'used';
  location?: string;
  categoryTags?: string[];
}

/**
 * Results from AI-powered image analysis of a boat.
 * Contains detected features and attributes with confidence scores.
 */
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

/**
 * Results from comparing two boats.
 * Includes similarities, differences, and recommendations.
 */
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

/**
 * Application environment configuration.
 * Defines feature flags, API endpoints, and other configurable settings.
 */
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
