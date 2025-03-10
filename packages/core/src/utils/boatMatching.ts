import { Boat, normalizeBoatType } from '../models/boat';

/**
 * Configuration for boat similarity calculation
 */
export interface BoatMatchingConfig {
  /** Weight for type matching (default: 0.35) */
  typeWeight?: number;
  
  /** Weight for length matching (default: 0.25) */
  lengthWeight?: number;
  
  /** Weight for feature matching (default: 0.15) */
  featureWeight?: number;
  
  /** Weight for engine type matching (default: 0.10) */
  engineTypeWeight?: number;
  
  /** Weight for hull material matching (default: 0.10) */
  hullMaterialWeight?: number;
  
  /** Weight for name/model matching (default: 0.05) */
  nameWeight?: number;
  
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Default weights for boat matching
 */
const DEFAULT_WEIGHTS: Required<Omit<BoatMatchingConfig, 'debug'>> = {
  typeWeight: 0.35,
  lengthWeight: 0.25,
  featureWeight: 0.15,
  engineTypeWeight: 0.10,
  hullMaterialWeight: 0.10,
  nameWeight: 0.05
};

/**
 * Calculate similarity score between two boats based on their attributes
 * @param boat1 First boat to compare
 * @param boat2 Second boat to compare
 * @param config Optional configuration for matching weights
 * @returns Similarity score from 0 to 1
 */
export const calculateBoatSimilarity = (
  boat1: Boat,
  boat2: Boat,
  config: BoatMatchingConfig = {}
): number => {
  // Combine default weights with provided config
  const weights = { ...DEFAULT_WEIGHTS, ...config };
  const { debug } = config;
  
  if (debug) {
    console.log(`Comparing boats: ${boat1.name} vs ${boat2.name}`);
  }
  
  let similarity = 0;
  let scoreBreakdown: Record<string, number> = {};
  
  // Type matching
  const normalizedType1 = normalizeBoatType(boat1.type || '');
  const normalizedType2 = normalizeBoatType(boat2.type || '');
  
  if (normalizedType1 === normalizedType2) {
    // Exact normalized type match
    similarity += weights.typeWeight;
    scoreBreakdown.typeScore = weights.typeWeight;
  } else if (
    (normalizedType1.includes('power') && normalizedType2.includes('power')) ||
    (normalizedType1.includes('sail') && normalizedType2.includes('sail')) ||
    (normalizedType1.includes('jet') && normalizedType2.includes('jet')) ||
    (normalizedType1.includes('cabin') && normalizedType2.includes('cabin'))
  ) {
    // Partial match in boat family
    similarity += weights.typeWeight / 2;
    scoreBreakdown.typeScore = weights.typeWeight / 2;
  } else {
    scoreBreakdown.typeScore = 0;
  }
  
  // Length matching (more forgiving for small differences)
  if (boat1.length && boat2.length) {
    const lengthDiff = Math.abs(boat1.length - boat2.length);
    const lengthScore = Math.max(0, weights.lengthWeight - (lengthDiff / 100));
    similarity += lengthScore;
    scoreBreakdown.lengthScore = lengthScore;
  } else {
    // If length info is missing, add a partial score
    similarity += weights.lengthWeight / 3;
    scoreBreakdown.lengthScore = weights.lengthWeight / 3;
  }
  
  // Feature matching with semantic understanding
  const features1 = boat1.features || [];
  const features2 = boat2.features || [];
  
  if (features1.length > 0 && features2.length > 0) {
    // Find common features with semantic matching
    const commonFeatures = features1.filter(f => 
      features2.some(f2 => 
        f.toLowerCase().includes(f2.toLowerCase()) || 
        f2.toLowerCase().includes(f.toLowerCase())
      )
    );
    
    const featureScore = (commonFeatures.length / Math.max(features1.length, features2.length)) * weights.featureWeight;
    similarity += featureScore;
    scoreBreakdown.featureScore = featureScore;
  } else {
    // If feature info is missing, add a partial score
    similarity += weights.featureWeight / 3;
    scoreBreakdown.featureScore = weights.featureWeight / 3;
  }
  
  // Engine type matching
  if (boat1.engineType && boat2.engineType) {
    const engineType1 = boat1.engineType.toLowerCase();
    const engineType2 = boat2.engineType.toLowerCase();
    
    if (engineType1 === engineType2) {
      similarity += weights.engineTypeWeight;
      scoreBreakdown.engineTypeScore = weights.engineTypeWeight;
    } else if (
      (engineType1.includes('outboard') && engineType2.includes('outboard')) ||
      (engineType1.includes('inboard') && engineType2.includes('inboard')) ||
      (engineType1.includes('jet') && engineType2.includes('jet'))
    ) {
      similarity += weights.engineTypeWeight / 2;
      scoreBreakdown.engineTypeScore = weights.engineTypeWeight / 2;
    } else {
      scoreBreakdown.engineTypeScore = 0;
    }
  } else {
    // If engine type info is missing, add a partial score
    similarity += weights.engineTypeWeight / 3;
    scoreBreakdown.engineTypeScore = weights.engineTypeWeight / 3;
  }
  
  // Hull material matching
  if (boat1.hullMaterial && boat2.hullMaterial) {
    const hullMaterial1 = boat1.hullMaterial.toLowerCase();
    const hullMaterial2 = boat2.hullMaterial.toLowerCase();
    
    if (hullMaterial1 === hullMaterial2) {
      similarity += weights.hullMaterialWeight;
      scoreBreakdown.hullMaterialScore = weights.hullMaterialWeight;
    } else {
      scoreBreakdown.hullMaterialScore = 0;
    }
  } else {
    // If hull material info is missing, add a partial score
    similarity += weights.hullMaterialWeight / 3;
    scoreBreakdown.hullMaterialScore = weights.hullMaterialWeight / 3;
  }
  
  // Name/model matching
  if (boat1.name && boat2.name) {
    const name1Words = boat1.name.toLowerCase().split(/\s+/);
    const name2Words = boat2.name.toLowerCase().split(/\s+/);
    
    // Find common meaningful words (longer than 2 characters)
    const commonWords = name1Words.filter(word => 
      name2Words.includes(word) && word.length > 2
    );
    
    if (commonWords.length > 0) {
      const nameScore = Math.min(
        weights.nameWeight,
        (commonWords.length / Math.max(name1Words.length, name2Words.length)) * weights.nameWeight
      );
      similarity += nameScore;
      scoreBreakdown.nameScore = nameScore;
    } else {
      scoreBreakdown.nameScore = 0;
    }
  } else {
    // If name info is missing, add a small partial score
    similarity += weights.nameWeight / 4;
    scoreBreakdown.nameScore = weights.nameWeight / 4;
  }
  
  // Ensure similarity is in valid range [0, 1]
  similarity = Math.max(0, Math.min(1, similarity));
  
  if (debug) {
    console.log('Similarity score breakdown:', scoreBreakdown);
    console.log('Total similarity:', similarity.toFixed(3));
  }
  
  return similarity;
};

/**
 * Find similar boats to a target boat
 * @param targetBoat The boat to find matches for
 * @param boatPool Array of boats to search through
 * @param config Optional configuration for matching
 * @param limit Maximum number of results to return (default: 3)
 * @returns Array of boats with match percentages
 */
export const findSimilarBoats = (
  targetBoat: Boat,
  boatPool: Boat[],
  config: BoatMatchingConfig = {},
  limit: number = 3
): Boat[] => {
  if (!targetBoat || !boatPool || boatPool.length === 0) {
    return [];
  }
  
  const { debug } = config;
  if (debug) {
    console.log(`Finding similar boats for: ${targetBoat.name}`, 
      `Pool size: ${boatPool.length}, Limit: ${limit}`);
  }
  
  // Calculate similarity scores for all boats in the pool
  const boatsWithScores = boatPool
    .filter(boat => boat.id !== targetBoat.id) // Exclude the target boat itself
    .map(boat => {
      const similarity = calculateBoatSimilarity(targetBoat, boat, config);
      return {
        ...boat,
        matchPercentage: Math.floor(similarity * 100)
      };
    });
  
  // Sort by match percentage (descending)
  boatsWithScores.sort((a, b) => b.matchPercentage! - a.matchPercentage!);
  
  // Take the top matches
  const topMatches = boatsWithScores.slice(0, limit);
  
  if (debug) {
    console.log(`Found ${topMatches.length} similar boats with scores:`, 
      topMatches.map(b => `${b.name}: ${b.matchPercentage}%`).join(', '));
  }
  
  return topMatches;
};
