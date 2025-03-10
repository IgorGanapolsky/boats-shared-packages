/**
 * Service for comparing boats and their features
 * This service handles comprehensive boat comparison functionality
 */

import { Boat, BoatComparisonResult } from '../types';
import { calculateBoatSimilarity } from '../utils/boat-matching.utils';

/**
 * Boat Comparison Service implementation
 */
export class BoatComparisonService {
  /**
   * Compare two boats and generate a detailed comparison result
   * @param boat1 First boat to compare
   * @param boat2 Second boat to compare
   * @returns Detailed comparison result
   */
  public compareBoats(boat1: Boat, boat2: Boat): BoatComparisonResult {
    // Calculate overall similarity score
    const similarityScore = calculateBoatSimilarity(boat1, boat2) * 100;
    
    // Find similarities and differences
    const similarities = this.findSimilarities(boat1, boat2);
    const differences = this.findDifferences(boat1, boat2);
    
    // Generate recommendation based on comparison
    const recommendation = this.generateRecommendation(boat1, boat2, similarityScore);
    
    // Create detailed comparison text
    const comparisonText = this.generateComparisonText(boat1, boat2, similarities, differences);
    
    return {
      boat1,
      boat2,
      similarities,
      differences,
      recommendation,
      similarityScore,
      comparisonText
    };
  }
  
  /**
   * Find similarities between two boats
   * @param boat1 First boat
   * @param boat2 Second boat
   * @returns Array of similarity descriptions
   */
  private findSimilarities(boat1: Boat, boat2: Boat): string[] {
    const similarities: string[] = [];
    
    // Compare manufacturer
    if (boat1.manufacturer && boat2.manufacturer && 
        boat1.manufacturer.toLowerCase() === boat2.manufacturer.toLowerCase()) {
      similarities.push(`Both boats are made by ${boat1.manufacturer}`);
    }
    
    // Compare hull type
    if (boat1.hullType && boat2.hullType && 
        boat1.hullType.toLowerCase() === boat2.hullType.toLowerCase()) {
      similarities.push(`Both boats have ${boat1.hullType.toLowerCase()} hulls`);
    }
    
    // Compare engine type
    if (boat1.engineType && boat2.engineType && 
        boat1.engineType.toLowerCase() === boat2.engineType.toLowerCase()) {
      similarities.push(`Both boats use ${boat1.engineType.toLowerCase()} engines`);
    }
    
    // Compare size (within 10% tolerance)
    if (boat1.length && boat2.length) {
      const lengthDiff = Math.abs(boat1.length - boat2.length);
      const lengthTolerance = Math.max(boat1.length, boat2.length) * 0.1;
      
      if (lengthDiff <= lengthTolerance) {
        similarities.push(`Both boats are similar in size (within 10% length difference)`);
      }
    }
    
    // Compare features
    if (boat1.features && boat2.features) {
      const commonFeatures = boat1.features.filter((feature: string) => 
        boat2.features.some((f: string) => f.toLowerCase() === feature.toLowerCase())
      );
      
      if (commonFeatures.length > 0) {
        commonFeatures.forEach((feature: string) => {
          similarities.push(`Both boats have ${feature}`);
        });
      }
    }
    
    return similarities;
  }
  
  /**
   * Find differences between two boats
   * @param boat1 First boat
   * @param boat2 Second boat
   * @returns Array of difference descriptions
   */
  private findDifferences(boat1: Boat, boat2: Boat): string[] {
    const differences: string[] = [];
    
    // Compare basic attributes
    this.compareBasicAttributes(boat1, boat2, differences);
    
    // Compare dimensions and specifications
    this.compareDimensions(boat1, boat2, differences);
    
    // Compare price
    this.comparePrice(boat1, boat2, differences);
    
    // Compare features
    this.compareFeatures(boat1, boat2, differences);
    
    return differences;
  }
  
  /**
   * Compare basic attributes like manufacturer and model
   * @param boat1 First boat
   * @param boat2 Second boat
   * @param differences Array to add differences to
   */
  private compareBasicAttributes(boat1: Boat, boat2: Boat, differences: string[]): void {
    // Compare manufacturer
    if (boat1.manufacturer && boat2.manufacturer && 
        boat1.manufacturer.toLowerCase() !== boat2.manufacturer.toLowerCase()) {
      differences.push(`Manufacturers differ: ${boat1.manufacturer} vs ${boat2.manufacturer}`);
    }
    
    // Compare model
    if (boat1.model && boat2.model && 
        boat1.model.toLowerCase() !== boat2.model.toLowerCase()) {
      differences.push(`Models differ: ${boat1.model} vs ${boat2.model}`);
    }
    
    // Compare year (if more than 3 years apart)
    if (boat1.year && boat2.year) {
      const yearDiff = Math.abs(boat1.year - boat2.year);
      if (yearDiff > 3) {
        const newer = boat1.year > boat2.year ? boat1 : boat2;
        const older = boat1.year > boat2.year ? boat2 : boat1;
        differences.push(`${newer.name} is ${yearDiff} years newer than ${older.name}`);
      }
    }
  }
  
  /**
   * Compare boat dimensions like length and beam
   * @param boat1 First boat
   * @param boat2 Second boat
   * @param differences Array to add differences to
   */
  private compareDimensions(boat1: Boat, boat2: Boat, differences: string[]): void {
    // Compare length (if more than 10% different)
    if (boat1.length && boat2.length) {
      const lengthDiff = Math.abs(boat1.length - boat2.length);
      const lengthTolerance = Math.max(boat1.length, boat2.length) * 0.1;
      
      if (lengthDiff > lengthTolerance) {
        const longer = boat1.length > boat2.length ? boat1 : boat2;
        const shorter = boat1.length > boat2.length ? boat2 : boat1;
        differences.push(`${longer.name} is significantly longer than ${shorter.name}`);
      }
    }
  }
  
  /**
   * Compare boat prices
   * @param boat1 First boat
   * @param boat2 Second boat
   * @param differences Array to add differences to
   */
  private comparePrice(boat1: Boat, boat2: Boat, differences: string[]): void {
    // Compare price (if available)
    if (boat1.price && boat2.price) {
      const priceDiff = Math.abs(boat1.price - boat2.price);
      const pricePercentDiff = priceDiff / Math.min(boat1.price, boat2.price) * 100;
      
      if (pricePercentDiff > 10) {
        const moreExpensive = boat1.price > boat2.price ? boat1 : boat2;
        const lessExpensive = boat1.price > boat2.price ? boat2 : boat1;
        differences.push(`${moreExpensive.name} is ${pricePercentDiff.toFixed(0)}% more expensive than ${lessExpensive.name}`);
      }
    }
  }
  
  /**
   * Compare boat features
   * @param boat1 First boat
   * @param boat2 Second boat
   * @param differences Array to add differences to
   */
  private compareFeatures(boat1: Boat, boat2: Boat, differences: string[]): void {
    // Compare unique features
    if (boat1.features && boat2.features) {
      const uniqueToBoat1 = boat1.features.filter((feature: string) => 
        !boat2.features.some((f: string) => f.toLowerCase() === feature.toLowerCase())
      );
      
      const uniqueToBoat2 = boat2.features.filter((feature: string) => 
        !boat1.features.some((f: string) => f.toLowerCase() === feature.toLowerCase())
      );
      
      if (uniqueToBoat1.length > 0) {
        differences.push(`${boat1.name} has these unique features: ${uniqueToBoat1.join(', ')}`);
      }
      
      if (uniqueToBoat2.length > 0) {
        differences.push(`${boat2.name} has these unique features: ${uniqueToBoat2.join(', ')}`);
      }
    }
  }
  
  /**
   * Generate a recommendation based on boat comparison
   * @param boat1 First boat
   * @param boat2 Second boat
   * @param similarityScore Similarity score between the boats
   * @returns Recommendation text
   */
  private generateRecommendation(boat1: Boat, boat2: Boat, similarityScore: number): string {
    if (similarityScore >= 90) {
      return `These boats are extremely similar. Consider factors like condition, price, and location to make your decision.`;
    } else if (similarityScore >= 70) {
      return `These boats share many characteristics but have some notable differences. Consider which specific features matter most to you.`;
    } else if (similarityScore >= 50) {
      return `These boats have some similarities but are quite different overall. Make sure to weigh the differences carefully based on your needs.`;
    } else {
      return `These boats are very different and likely serve different purposes. Consider what you'll primarily use the boat for.`;
    }
  }
  
  /**
   * Generate detailed comparison text
   * @param boat1 First boat
   * @param boat2 Second boat
   * @param similarities List of similarities
   * @param differences List of differences
   * @returns Detailed comparison text
   */
  private generateComparisonText(
    boat1: Boat, 
    boat2: Boat, 
    similarities: string[],
    differences: string[]
  ): string {
    const sections = [];
    
    // Introduction
    sections.push(`# Comparison: ${boat1.name} vs ${boat2.name}\n`);
    
    // Overview section
    sections.push(`## Overview\n`);
    sections.push(`Comparing the ${boat1.manufacturer || ''} ${boat1.model || ''} (${boat1.year || 'N/A'}) with the ${boat2.manufacturer || ''} ${boat2.model || ''} (${boat2.year || 'N/A'}).\n`);
    
    // Similarities section
    sections.push(`## Similarities\n`);
    if (similarities.length > 0) {
      similarities.forEach(similarity => {
        sections.push(`- ${similarity}`);
      });
    } else {
      sections.push(`No significant similarities found.`);
    }
    sections.push('');
    
    // Differences section
    sections.push(`## Differences\n`);
    if (differences.length > 0) {
      differences.forEach(difference => {
        sections.push(`- ${difference}`);
      });
    } else {
      sections.push(`No significant differences found.`);
    }
    sections.push('');
    
    // Specifications comparison
    sections.push(`## Specifications Comparison\n`);
    sections.push(`| Specification | ${boat1.name} | ${boat2.name} |`);
    sections.push(`|---------------|------------|------------|`);
    sections.push(`| Manufacturer | ${boat1.manufacturer || 'N/A'} | ${boat2.manufacturer || 'N/A'} |`);
    sections.push(`| Model | ${boat1.model || 'N/A'} | ${boat2.model || 'N/A'} |`);
    sections.push(`| Year | ${boat1.year || 'N/A'} | ${boat2.year || 'N/A'} |`);
    sections.push(`| Length | ${this.formatLength(boat1.length)} | ${this.formatLength(boat2.length)} |`);
    sections.push(`| Beam | ${this.formatLength(boat1.beam)} | ${this.formatLength(boat2.beam)} |`);
    sections.push(`| Hull Type | ${boat1.hullType || 'N/A'} | ${boat2.hullType || 'N/A'} |`);
    sections.push(`| Engine Type | ${boat1.engineType || 'N/A'} | ${boat2.engineType || 'N/A'} |`);
    sections.push(`| Price | ${this.formatPrice(boat1)} | ${this.formatPrice(boat2)} |`);
    sections.push('');
    
    return sections.join('\n');
  }
  
  /**
   * Format length value for display
   * @param length Length value in feet
   * @returns Formatted length string
   */
  private formatLength(length?: number): string {
    return length ? `${length} ft` : 'N/A';
  }
  
  /**
   * Format price value for display
   * @param boat Boat with price information
   * @returns Formatted price string
   */
  private formatPrice(boat: Boat): string {
    if (!boat.price) return 'N/A';
    const currency = boat.currency || '$';
    return `${currency}${boat.price.toLocaleString()}`;
  }
}

// Export singleton instance
export const boatComparisonService = new BoatComparisonService();
