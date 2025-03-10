/**
 * Type definitions for state management that works across platforms
 */

import { Boat, ImageAnalysisResult, BoatComparisonResult } from './index';

// Application state slices
export interface AppState {
  boats: BoatsState;
  user: UserState;
  ui: UIState;
  analysis: AnalysisState;
}

export interface BoatsState {
  boats: Boat[];
  selectedBoats: Boat[];
  comparisonResult: BoatComparisonResult | null;
  loading: boolean;
  error: string | null;
}

export interface UserState {
  isAuthenticated: boolean;
  profile: UserProfile | null;
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  currentView: string;
  sidebar: {
    open: boolean;
  };
  modal: {
    open: boolean;
    type: string | null;
    data: any;
  };
}

export interface AnalysisState {
  currentAnalysis: ImageAnalysisResult | null;
  history: ImageAnalysisResult[];
  loading: boolean;
  error: string | null;
}

// User-related types
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  analyticsConsent: boolean;
  advancedMode: boolean;
  measurementUnit: 'imperial' | 'metric';
}

// Context types for React Context API
export interface BoatsContextType {
  state: BoatsState;
  actions: {
    fetchBoats: () => Promise<void>;
    selectBoat: (boatId: string) => void;
    compareBoats: (boat1Id: string, boat2Id: string) => Promise<void>;
    clearSelection: () => void;
  };
}

export interface AnalysisContextType {
  state: AnalysisState;
  actions: {
    analyzeImage: (file: File) => Promise<void>;
    clearAnalysis: () => void;
    saveAnalysis: (analysis: ImageAnalysisResult) => Promise<void>;
  };
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
