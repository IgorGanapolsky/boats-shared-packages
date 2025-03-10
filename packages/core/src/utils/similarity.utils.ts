/**
 * Similarity utilities for comparing objects and features
 * These utilities provide mechanisms to calculate similarity between objects
 */

/**
 * Calculate the cosine similarity between two vectors
 * @param vector1 First feature vector 
 * @param vector2 Second feature vector
 * @returns A similarity score between 0 and 1, where 1 indicates identical vectors
 */
export function calculateCosineSimilarity(
  vector1: number[] | Float32Array,
  vector2: number[] | Float32Array
): number {
  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    magnitude1 += vector1[i] * vector1[i];
    magnitude2 += vector2[i] * vector2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  // Prevent division by zero
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Calculate Euclidean distance between two vectors
 * @param vector1 First feature vector
 * @param vector2 Second feature vector
 * @returns Distance value (lower means more similar)
 */
export function calculateEuclideanDistance(
  vector1: number[] | Float32Array,
  vector2: number[] | Float32Array
): number {
  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same length');
  }

  let sum = 0;
  for (let i = 0; i < vector1.length; i++) {
    const diff = vector1[i] - vector2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Calculate Jaccard similarity between two sets
 * @param set1 First set of items
 * @param set2 Second set of items
 * @returns A similarity score between 0 and 1, where 1 indicates identical sets
 */
export function calculateJaccardSimilarity<T>(set1: Set<T> | T[], set2: Set<T> | T[]): number {
  const s1 = set1 instanceof Set ? set1 : new Set(set1);
  const s2 = set2 instanceof Set ? set2 : new Set(set2);

  if (s1.size === 0 && s2.size === 0) {
    return 1; // Both empty sets are considered identical
  }

  const intersection = new Set<T>();
  s1.forEach(item => {
    if (s2.has(item)) {
      intersection.add(item);
    }
  });

  const union = new Set<T>([...s1, ...s2]);
  
  return intersection.size / union.size;
}

/**
 * Calculate string similarity based on Levenshtein distance
 * @param str1 First string
 * @param str2 Second string
 * @returns A similarity score between 0 and 1, where 1 indicates identical strings
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  
  // Convert to lowercase for case-insensitive comparison
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(s1, s2);
  
  // Calculate similarity as 1 - normalized distance
  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 1; // Both empty strings
  
  return 1 - distance / maxLength;
}

/**
 * Calculate Levenshtein distance between two strings
 * @param str1 First string
 * @param str2 Second string
 * @returns Edit distance (lower means more similar)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  // Create a matrix of size (m+1) x (n+1)
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  
  // Initialize first row and first column
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  
  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // Deletion
          dp[i][j - 1] + 1, // Insertion
          dp[i - 1][j - 1] + 1 // Substitution
        );
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Normalize a score to a value between 0 and 1
 * @param score Original score
 * @param min Minimum possible score
 * @param max Maximum possible score
 * @returns Normalized score between 0 and 1
 */
export function normalizeScore(score: number, min: number = 0, max: number = 1): number {
  if (min === max) return 0.5; // Avoid division by zero
  
  // Clamp to range
  const clampedScore = Math.max(min, Math.min(max, score));
  
  // Normalize
  return (clampedScore - min) / (max - min);
}
