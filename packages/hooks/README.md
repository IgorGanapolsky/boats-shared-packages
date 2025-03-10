# @igorganapolsky/boats-hooks

React hooks for Boats.com applications.

## Installation

```bash
npm install @igorganapolsky/boats-hooks
# or
yarn add @igorganapolsky/boats-hooks
```

## Features

- Boat comparison hooks
- Image analysis hooks
- Boat search hooks
- Theme management hooks

## Usage

```typescript
import { useBoatComparison, useImageAnalysis } from '@igorganapolsky/boats-hooks';

// Use boat comparison hook
function MyComponent() {
  const { compareBoats, isLoading, error } = useBoatComparison();
  
  // Use the comparison functionality
  const handleCompare = async () => {
    const result = await compareBoats(boatA, boatB);
    console.log(result);
  };
  
  return (
    // Component JSX
  );
}
```

## Dependencies

This package depends on:
- `@igorganapolsky/boats-core` - Core business logic
- `@igorganapolsky/boats-types` - Shared type definitions
- `@tanstack/react-query` - For data fetching and caching

## License

MIT
