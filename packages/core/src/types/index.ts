/**
 * Temporary type definitions until @boats/types is properly setup
 * This helps avoid circular dependencies during development
 */

// Re-export the types that are needed by the core package
// These will be removed once the types package is properly published

export interface Boat {
  id: string;
  name: string;
  manufacturer?: string;
  model?: string;
  year?: number;
  length?: number;
  beam?: number;
  draft?: number;
  weight?: number;
  engineType?: string;
  hullType?: string;
  fuelType?: string;
  cabins?: number;
  berths?: number;
  features: string[];
  imageUrls: string[];
  primaryImageUrl?: string;
  videoUrls?: string[];
  description?: string;
  price?: number;
  currency?: string;
  condition?: 'new' | 'used';
  location?: string;
  categoryTags?: string[];
}

export interface BoatComparisonResult {
  boat1: Boat;
  boat2: Boat;
  similarities: string[];
  differences: string[];
  recommendation?: string;
  similarityScore?: number;
  comparisonText?: string;
}

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

export interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number;
}
