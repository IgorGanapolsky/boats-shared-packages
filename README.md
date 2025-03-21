# Boats Shared Packages

A collection of shared packages for AI Compare Boats applications, designed to be used across web and mobile platforms.

## Packages

- **@boats/core**: Core business logic and utilities for Boats.com applications
- **@boats/hooks**: React hooks for Boats.com applications
- **@boats/api**: API client services for Boats.com applications
- **@boats/types**: Shared TypeScript types for the Boats.com ecosystem
- **@boats/state**: State management utilities (coming soon)
- **@boats/ui**: Shared UI components (coming soon)

## Installation

### Setting up GitHub Packages

These packages are hosted on GitHub Packages. To install them, you'll need to authenticate with GitHub Packages:

1. Create a GitHub Personal Access Token with `read:packages` scope
2. Configure npm or yarn to use GitHub Packages for the @boats scope:

```bash
# For npm
npm config set @boats:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken YOUR_GITHUB_TOKEN

# For yarn
echo "@boats:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc
```

### Installing Packages

```bash
# Install a specific package
npm install @boats/core
# or with yarn
yarn add @boats/core
```

## Usage

### Core Utilities

```typescript
import { compareBoats, getBoatSimilarity } from '@boats/core';

// Compare two boats
const similarity = compareBoats(boatA, boatB);

// Get similarity score
const score = getBoatSimilarity(boatA, boatB);
```

### Hooks

```typescript
import { useBoatComparison } from '@boats/hooks';

const MyComponent = () => {
  const { compareBoats, isLoading, error } = useBoatComparison();
  
  // Use the hook in your component
  return (
    // ...
  );
};
```

### API Client

```typescript
import { boatApiClient } from '@boats/api';

// Get boat details
const boatDetails = await boatApiClient.getBoatDetails('boat-123');
```

### Image Analysis

```typescript
import { analyzeBoatImage } from '@boats/core';

// Analyze boat image 
const analysisResult = await analyzeBoatImage(base64Image);
console.log(analysisResult.boatType); // e.g., 'Yacht'
console.log(analysisResult.features); // e.g., ['White hull', 'Two decks', 'Sail']
```

## React Native Compatibility

These packages have been updated to support React Native applications. Specifically:

1. The `@boats/core` package includes the `analyzeBoatImage` function for mobile image analysis
2. The `@boats/api` package includes the `getBoatDetails` function for fetching boat information

## Development

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Run tests
yarn test

# Lint code
yarn lint
```

### Setting up the local environment

```bash
# Clone the repository
git clone https://github.com/IgorGanapolsky/boats-shared-packages.git
cd boats-shared-packages

# Install dependencies
npm install

# Build all packages
npm run build
```

### Link to local project

For development, you can link these packages locally:

```bash
# From the shared packages root
npm run build

# Link a specific package
cd packages/core
npm link

# In your project
npm link @boats/core
```

## License

MIT
