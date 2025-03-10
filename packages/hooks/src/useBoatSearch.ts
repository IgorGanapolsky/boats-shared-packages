/**
 * Hook for searching boats with filtering and sorting capabilities
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  withRetry,
  fetchWithTimeout,
  getEnvironmentConfig
} from '@boats/core';
import { Boat } from '@boats/types';

// Query key for caching
const BOAT_SEARCH_KEY = 'boatSearch';

type SortField = 'price' | 'year' | 'length' | 'name';
type SortDirection = 'asc' | 'desc';

interface BoatSearchFilters {
  priceRange?: [number | null, number | null];
  yearRange?: [number | null, number | null];
  lengthRange?: [number | null, number | null];
  manufacturers?: string[];
  boatTypes?: string[];
  features?: string[];
  condition?: 'new' | 'used' | null;
}

interface BoatSearchOptions {
  initialFilters?: BoatSearchFilters;
  initialSort?: {
    field: SortField;
    direction: SortDirection;
  };
  pageSize?: number;
  apiUrl?: string;
}

interface BoatSearchState {
  boats: Boat[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: Error | null;
  filters: BoatSearchFilters;
  sort: {
    field: SortField;
    direction: SortDirection;
  };
}

/**
 * Hook for searching, filtering, and paginating boats
 * Works across platforms and manages its own state
 */
export function useBoatSearch(options: BoatSearchOptions = {}) {
  const { 
    initialFilters = {},
    initialSort = { field: 'price', direction: 'asc' },
    pageSize = 10,
    apiUrl
  } = options;
  
  // Get environment configuration
  const envConfig = getEnvironmentConfig();
  const baseApiUrl = apiUrl || envConfig.apiUrl;
  
  // State for search parameters
  const [searchState, setSearchState] = useState<BoatSearchState>({
    boats: [],
    totalCount: 0,
    currentPage: 1,
    pageSize,
    isLoading: false,
    error: null,
    filters: initialFilters,
    sort: initialSort
  });
  
  // Current search query string for the API
  const searchQuery = useMemo(() => {
    const { filters, sort, currentPage, pageSize } = searchState;
    
    // Build query parameters
    const params = new URLSearchParams();
    
    // Pagination
    params.append('page', currentPage.toString());
    params.append('pageSize', pageSize.toString());
    
    // Sorting
    params.append('sortField', sort.field);
    params.append('sortDirection', sort.direction);
    
    // Filters
    if (filters.priceRange) {
      if (filters.priceRange[0] !== null) {
        params.append('minPrice', filters.priceRange[0].toString());
      }
      if (filters.priceRange[1] !== null) {
        params.append('maxPrice', filters.priceRange[1].toString());
      }
    }
    
    if (filters.yearRange) {
      if (filters.yearRange[0] !== null) {
        params.append('minYear', filters.yearRange[0].toString());
      }
      if (filters.yearRange[1] !== null) {
        params.append('maxYear', filters.yearRange[1].toString());
      }
    }
    
    if (filters.lengthRange) {
      if (filters.lengthRange[0] !== null) {
        params.append('minLength', filters.lengthRange[0].toString());
      }
      if (filters.lengthRange[1] !== null) {
        params.append('maxLength', filters.lengthRange[1].toString());
      }
    }
    
    if (filters.manufacturers?.length) {
      filters.manufacturers.forEach(m => {
        params.append('manufacturer', m);
      });
    }
    
    if (filters.boatTypes?.length) {
      filters.boatTypes.forEach(t => {
        params.append('boatType', t);
      });
    }
    
    if (filters.features?.length) {
      filters.features.forEach(f => {
        params.append('feature', f);
      });
    }
    
    if (filters.condition) {
      params.append('condition', filters.condition);
    }
    
    return params.toString();
  }, [searchState]);
  
  // Query for fetching boats
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [BOAT_SEARCH_KEY, searchQuery],
    queryFn: async () => {
      try {
        const response = await withRetry(() => 
          fetchWithTimeout<{
            boats: Boat[];
            totalCount: number;
          }>(`${baseApiUrl}/boats?${searchQuery}`)
        );
        
        return response;
      } catch (err) {
        throw err instanceof Error ? err : new Error(String(err));
      }
    },
    enabled: !!baseApiUrl, // Only run if we have an API URL
    staleTime: 1000 * 60 * 5, // Consider results stale after 5 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  // Update state when query results change
  useMemo(() => {
    if (data) {
      setSearchState(prev => ({
        ...prev,
        boats: data.boats,
        totalCount: data.totalCount,
        isLoading,
        error: error as Error | null
      }));
    } else if (error) {
      setSearchState(prev => ({
        ...prev,
        isLoading,
        error: error as Error
      }));
    } else {
      setSearchState(prev => ({
        ...prev,
        isLoading
      }));
    }
  }, [data, isLoading, error]);
  
  // Helper function to update filters
  const updateFilters = useCallback((newFilters: Partial<BoatSearchFilters>) => {
    setSearchState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters
      },
      currentPage: 1 // Reset to first page when filters change
    }));
  }, []);
  
  // Helper function to update sort
  const updateSort = useCallback((field: SortField, direction: SortDirection) => {
    setSearchState(prev => ({
      ...prev,
      sort: {
        field,
        direction
      }
    }));
  }, []);
  
  // Helper function to change page
  const goToPage = useCallback((page: number) => {
    setSearchState(prev => ({
      ...prev,
      currentPage: Math.max(1, page)
    }));
  }, []);
  
  // Helper function to reset all search parameters
  const resetSearch = useCallback(() => {
    setSearchState({
      boats: [],
      totalCount: 0,
      currentPage: 1,
      pageSize,
      isLoading: false,
      error: null,
      filters: {},
      sort: { field: 'price', direction: 'asc' }
    });
  }, [pageSize]);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(searchState.totalCount / searchState.pageSize);
  }, [searchState.totalCount, searchState.pageSize]);
  
  // Memoized return value
  return {
    // Search results
    boats: searchState.boats,
    totalCount: searchState.totalCount,
    isLoading: searchState.isLoading,
    error: searchState.error,
    
    // Pagination
    currentPage: searchState.currentPage,
    pageSize: searchState.pageSize,
    totalPages,
    goToPage,
    
    // Filtering and sorting
    filters: searchState.filters,
    sort: searchState.sort,
    updateFilters,
    updateSort,
    
    // Search operations
    resetSearch,
    refetch
  };
}
