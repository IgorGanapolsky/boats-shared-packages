# Boats Shared Packages

A collection of shared packages for AI Compare Boats applications, designed to be used across web and mobile platforms.

## Packages

- **@igorganapolsky/boats-core**: Core business logic and utilities for Boats.com applications
- **@igorganapolsky/boats-hooks**: React hooks for Boats.com applications
- **@igorganapolsky/boats-api**: API client services for Boats.com applications
- **@igorganapolsky/boats-types**: Shared TypeScript types for the Boats.com ecosystem
- **@igorganapolsky/boats-state**: State management utilities (coming soon)
- **@igorganapolsky/boats-ui**: Shared UI components (coming soon)

## Installation

### Setting up GitHub Packages

These packages are hosted on GitHub Packages. To install them, you'll need to authenticate with GitHub Packages:

1. Create a GitHub Personal Access Token with `read:packages` scope
2. Configure npm or yarn to use GitHub Packages for the @igorganapolsky scope:

```bash
# For npm
npm config set @igorganapolsky:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken YOUR_GITHUB_TOKEN

# For yarn
echo "@igorganapolsky:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc
```

### Installing Packages

```bash
# Install a specific package
npm install @igorganapolsky/boats-core
# or with yarn
yarn add @igorganapolsky/boats-core
```

## Usage

### Core Utilities

```typescript
import { compareBoats, getBoatSimilarity } from '@igorganapolsky/boats-core';

// Compare two boats
const similarity = compareBoats(boatA, boatB);

// Get similarity score
const score = getBoatSimilarity(boatA, boatB);
```

### Hooks

```typescript
import { useBoatComparison } from '@igorganapolsky/boats-hooks';

const MyComponent = () => {
  const { compareBoats, isLoading, error } = useBoatComparison();
  
  // Use the hook in your component
  return (
    // ...
  );
};
```

### API Services

```typescript
import { BoatService } from '@igorganapolsky/boats-api';

// Fetch boat data
const boatData = await BoatService.getBoatById('boat-123');
```

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

## License

MIT
