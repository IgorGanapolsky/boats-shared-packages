# Boats.com Shared Packages

This repository contains shared packages used across Boats.com web and mobile applications. These packages are designed to work with both React web applications and React Native (Expo) mobile apps.

## Packages

### @boats/core

Core services, utilities, and models for Boats.com applications:

- AI Services: OpenAI and TensorFlow integrations
- Image Analysis: Computer vision utilities for boat comparison
- Data Models: Shared data structures and schemas
- Utilities: Networking, comparison algorithms, etc.

### @boats/hooks

React hooks for use in both web and mobile applications:

- `useImageAnalysis`: Process and analyze boat images
- `useBoatComparison`: Compare boats and their features
- `useBoatSize`: Calculate and compare boat dimensions
- `useFeatureAnalysis`: Analyze boat features and specifications

## Using in Your Project

### Installing the Packages

```bash
# For npm
npm install @boats/core @boats/hooks

# For yarn
yarn add @boats/core @boats/hooks

# For Expo projects
expo install @boats/core @boats/hooks
```

### Setup for Expo Projects

In your Expo mobile app, create a `metro.config.js` file (if not already present):

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow importing from external packages
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
config.resolver.extraNodeModules = {
  '@boats/core': '<path-to-node_modules>/@boats/core',
  '@boats/hooks': '<path-to-node_modules>/@boats/hooks',
};

module.exports = config;
```

### Example Usage

```javascript
// In your React or React Native app
import { OpenAIService } from '@boats/core';
import { useBoatComparison } from '@boats/hooks';

// Set up OpenAI service
const openaiService = new OpenAIService({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Use hooks in your components
function BoatComparisonScreen() {
  const { 
    boats, 
    selectedBoats, 
    comparisonResults,
    compareBoats, 
    selectBoat 
  } = useBoatComparison(boatService);
  
  // Your component logic here
}
```

## Integration with AWS CodeBuild and Fastlane

These packages are designed to be consumed by mobile apps using AWS CodeBuild with Fastlane for CI/CD. The GitHub repository contains workflows for automatic publishing when updates are pushed to the main branch.

## Development

To develop these packages:

```bash
# Install dependencies
cd boats-packages
npm install

# Build all packages
npm run build

# Run tests
npm test
```
