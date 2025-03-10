# @igorganapolsky/boats-types

Shared TypeScript types for the Boats.com ecosystem.

## Installation

```bash
npm install @igorganapolsky/boats-types
# or
yarn add @igorganapolsky/boats-types
```

## Features

- Comprehensive type definitions for boat data
- Network request and response types
- UI component types
- State management types
- Service interface types

## Usage

```typescript
import { Boat, BoatImage, ComparisonResult } from '@igorganapolsky/boats-types';

// Define a boat object with proper typing
const boat: Boat = {
  id: 'boat-123',
  name: 'Sailboat 2000',
  manufacturer: 'BestBoats',
  year: 2022,
  // ...other properties
};

// Type your function parameters and returns
function compareBoats(boatA: Boat, boatB: Boat): ComparisonResult {
  // Implementation
  return {
    similarityScore: 0.85,
    matchingFeatures: ['manufacturer', 'length'],
    differences: {
      'year': { a: 2022, b: 2020 },
      'price': { a: 25000, b: 22000 }
    }
  };
}
```

## Type Categories

- `/network.ts` - API-related types
- `/services.ts` - Service interface types
- `/state.ts` - State management types
- `/ui.ts` - UI component types

## License

MIT
