import { useState, useCallback } from 'react';
import { useQuery } from 'react-query';

// Define types for our boat entities
export interface Boat {
  id: string;
  name: string;
  manufacturer?: string;
  model?: string;
  year?: number;
  length?: number;
  features?: string[];
  imageUrl?: string;
  [key: string]: any;
}

export interface ComparisonResult {
  boat1: Boat;
  boat2: Boat;
  similarities: string[];
  differences: string[];
  recommendation?: string;
  comparisonText?: string;
}

interface BoatDatabaseService {
  getAllBoats: () => Promise<Boat[]>;
  compareBoats: (boat1Id: string, boat2Id: string) => Promise<ComparisonResult | null>;
}

export interface UseBoatComparisonResult {
  boats: Boat[];
  selectedBoats: Boat[];
  comparisonResults: ComparisonResult | null;
  isLoading: boolean;
  error: Error | null;
  compareBoats: (boat1Id: string, boat2Id: string) => void;
  selectBoat: (boatId: string) => void;
  clearSelection: () => void;
}

export function useBoatComparison(boatService: BoatDatabaseService): UseBoatComparisonResult {
  const [selectedBoats, setSelectedBoats] = useState<Boat[]>([]);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult | null>(null);

  const { data: boats = [], isLoading, error } = useQuery('boats', boatService.getAllBoats, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const compareBoats = useCallback((boat1Id: string, boat2Id: string) => {
    if (!boats.length) return;
    
    boatService.compareBoats(boat1Id, boat2Id)
      .then(comparison => {
        if (comparison) {
          setSelectedBoats([comparison.boat1, comparison.boat2]);
          setComparisonResults(comparison);
        }
      })
      .catch(err => console.error('Error comparing boats:', err));
  }, [boats, boatService]);

  const selectBoat = useCallback((boatId: string) => {
    if (!boats.length) return;

    const boat = boats.find(b => b.id === boatId);
    if (!boat) return;

    setSelectedBoats(prev => {
      // If the boat is already selected, remove it
      if (prev.some(b => b.id === boatId)) {
        return prev.filter(b => b.id !== boatId);
      }
      
      // If we already have 2 boats, replace the second one
      if (prev.length >= 2) {
        return [prev[0], boat];
      }
      
      // Otherwise add the new boat
      return [...prev, boat];
    });
    
    // Clear comparison results when selection changes
    setComparisonResults(null);
  }, [boats]);

  const clearSelection = useCallback(() => {
    setSelectedBoats([]);
    setComparisonResults(null);
  }, []);

  return {
    boats,
    selectedBoats,
    comparisonResults,
    isLoading,
    error,
    compareBoats,
    selectBoat,
    clearSelection
  };
}
