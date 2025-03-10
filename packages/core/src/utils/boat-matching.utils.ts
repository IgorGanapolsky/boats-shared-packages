/**
 * @file Boat matching utilities for finding and comparing similar boats.
 * @module boats-core/utils/boat-matching
 * @description These utilities provide mechanisms to match boats based on various criteria
 * including dimensions, features, manufacturer, and model information.
 */

import { Boat } from '../types';
import { calculateJaccardSimilarity, calculateStringSimilarity } from './similarity.utils';

/**
 * Calculate similarity score between two boats
 * @param boat1 First boat to compare
 * @param boat2 Second boat to compare
 * @returns A similarity score between 0 and 1
 */
export function calculateBoatSimilarity(boat1: Boat, boat2: Boat): number {
  // Define weights for different comparison attributes
  const weights = {
    manufacturer: 0.15,
    model: 0.20,
    year: 0.05,
    dimensions: 0.15,
    features: 0.25,
    category: 0.20
  };
  
  // Calculate similarity for each component
  let totalScore = 0;
  let totalWeight = 0;
  
  // Manufacturer similarity
  if (boat1.manufacturer && boat2.manufacturer) {
    const manufacturerScore = calculateStringSimilarity(boat1.manufacturer, boat2.manufacturer);
    totalScore += manufacturerScore * weights.manufacturer;
    totalWeight += weights.manufacturer;
  }
  
  // Model similarity
  if (boat1.model && boat2.model) {
    const modelScore = calculateStringSimilarity(boat1.model, boat2.model);
    totalScore += modelScore * weights.model;
    totalWeight += weights.model;
  }
  
  // Year similarity (normalized difference)
  if (boat1.year && boat2.year) {
    // Consider boats within 5 years to be potentially similar
    const yearDiff = Math.abs(boat1.year - boat2.year);
    const yearScore = Math.max(0, 1 - yearDiff / 5);
    totalScore += yearScore * weights.year;
    totalWeight += weights.year;
  }
  
  // Dimension similarity
  const dimensionScore = calculateDimensionSimilarity(boat1, boat2);
  if (dimensionScore !== null) {
    totalScore += dimensionScore * weights.dimensions;
    totalWeight += weights.dimensions;
  }
  
  // Feature similarity
  if (boat1.features && boat2.features) {
    const featureScore = calculateJaccardSimilarity(boat1.features, boat2.features);
    totalScore += featureScore * weights.features;
    totalWeight += weights.features;
  }
  
  // Category tags similarity
  if (boat1.categoryTags && boat2.categoryTags) {
    const categoryScore = calculateJaccardSimilarity(boat1.categoryTags, boat2.categoryTags);
    totalScore += categoryScore * weights.category;
    totalWeight += weights.category;
  }
  
  // Normalize by the total weight of applicable comparisons
  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * Calculate similarity based on boat dimensions
 * @param boat1 First boat
 * @param boat2 Second boat
 * @returns Similarity score or null if dimensions can't be compared
 */
function calculateDimensionSimilarity(boat1: Boat, boat2: Boat): number | null {
  // Track how many dimensions we can compare
  let comparableDimensions = 0;
  let totalDimensionScore = 0;
  
  // Compare length
  if (boat1.length && boat2.length) {
    const lengthRatio = Math.min(boat1.length, boat2.length) / Math.max(boat1.length, boat2.length);
    totalDimensionScore += lengthRatio;
    comparableDimensions++;
  }
  
  // Compare beam
  if (boat1.beam && boat2.beam) {
    const beamRatio = Math.min(boat1.beam, boat2.beam) / Math.max(boat1.beam, boat2.beam);
    totalDimensionScore += beamRatio;
    comparableDimensions++;
  }
  
  // Compare draft
  if (boat1.draft && boat2.draft) {
    const draftRatio = Math.min(boat1.draft, boat2.draft) / Math.max(boat1.draft, boat2.draft);
    totalDimensionScore += draftRatio;
    comparableDimensions++;
  }
  
  // Compare weight
  if (boat1.weight && boat2.weight) {
    const weightRatio = Math.min(boat1.weight, boat2.weight) / Math.max(boat1.weight, boat2.weight);
    totalDimensionScore += weightRatio;
    comparableDimensions++;
  }
  
  return comparableDimensions > 0 ? totalDimensionScore / comparableDimensions : null;
}

/**
 * Find similar boats in a dataset based on a reference boat
 * @param referenceBoat The boat to find similar matches for
 * @param boatDataset Array of boats to search through
 * @param similarityThreshold Minimum similarity score (0-1) to consider as a match
 * @param limit Maximum number of similar boats to return
 * @returns Array of similar boats with their similarity scores
 */
export function findSimilarBoats(
  referenceBoat: Boat,
  boatDataset: Boat[],
  similarityThreshold: number = 0.7,
  limit: number = 10
): Array<{ boat: Boat; similarityScore: number }> {
  // Calculate similarity for each boat in the dataset
  const similarityResults = boatDataset
    .filter(boat => boat.id !== referenceBoat.id) // Exclude the reference boat itself
    .map(boat => ({
      boat,
      similarityScore: calculateBoatSimilarity(referenceBoat, boat)
    }))
    .filter(result => result.similarityScore >= similarityThreshold)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);
  
  return similarityResults;
}

/**
 * Find boats by model, applying fuzzy matching
 * @param modelQuery Search query for the model
 * @param boats Array of boats to search through
 * @param threshold Minimum similarity threshold (0-1)
 * @returns Matched boats sorted by relevance
 */
export function findBoatsByModel(
  modelQuery: string,
  boats: Boat[],
  threshold: number = 0.7
): Array<{ boat: Boat; relevance: number }> {
  return boats
    .filter(boat => boat.model)
    .map(boat => ({
      boat,
      relevance: calculateStringSimilarity(modelQuery, boat.model || '')
    }))
    .filter(result => result.relevance >= threshold)
    .sort((a, b) => b.relevance - a.relevance);
}

/**
 * Find boats by manufacturer, applying fuzzy matching
 * @param manufacturerQuery Search query for the manufacturer
 * @param boats Array of boats to search through
 * @param threshold Minimum similarity threshold (0-1)
 * @returns Matched boats sorted by relevance
 */
export function findBoatsByManufacturer(
  manufacturerQuery: string,
  boats: Boat[],
  threshold: number = 0.7
): Array<{ boat: Boat; relevance: number }> {
  return boats
    .filter(boat => boat.manufacturer)
    .map(boat => ({
      boat,
      relevance: calculateStringSimilarity(manufacturerQuery, boat.manufacturer || '')
    }))
    .filter(result => result.relevance >= threshold)
    .sort((a, b) => b.relevance - a.relevance);
}
