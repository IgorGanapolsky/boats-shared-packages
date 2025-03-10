import { useState } from 'react';
import { useQuery } from 'react-query';
import { findSimilarBoats } from '@boats/core';

interface AnalysisResult {
  id?: string;
  type?: string;
  manufacturer?: string;
  features?: string[];
  description?: string;
  [key: string]: any;
}

interface UseImageAnalysisResult {
  analysis: AnalysisResult | null;
  similarBoats: any[];
  isLoading: boolean;
  error: Error | null;
  handleAnalysisComplete: (newAnalysis: AnalysisResult) => void;
  resetAnalysis: () => void;
}

export function useImageAnalysis(): UseImageAnalysisResult {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { data: similarBoats = [], isLoading } = useQuery(
    ['similarBoats', analysis],
    () => findSimilarBoats(analysis as AnalysisResult),
    {
      enabled: !!analysis,
      staleTime: Infinity,
      cacheTime: Infinity,
      onError: (err: Error) => {
        console.error('Error finding similar boats:', err);
        setError(err);
      }
    }
  );

  const handleAnalysisComplete = async (newAnalysis: AnalysisResult) => {
    try {
      setError(null);
      setAnalysis(newAnalysis);
    } catch (err) {
      console.error('Error handling analysis:', err);
      setError(err as Error);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setError(null);
  };

  return {
    analysis,
    similarBoats,
    isLoading,
    error,
    handleAnalysisComplete,
    resetAnalysis
  };
}
