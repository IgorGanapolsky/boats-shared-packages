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

### API Services

```typescript
import { BoatService } from '@boats/api';

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
