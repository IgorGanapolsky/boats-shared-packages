# @igorganapolsky/boats-core

Core business logic and utilities for Boats.com applications.

## Installation

```bash
npm install @igorganapolsky/boats-core
# or
yarn add @igorganapolsky/boats-core
```

## Features

- Image analysis services
- Boat comparison services
- OpenAI integration
- TensorFlow integration
- Utility functions for boat matching and similarity

## Usage

```typescript
import { compareBoats, getBoatSimilarity } from '@igorganapolsky/boats-core';

// Compare two boats
const similarity = compareBoats(boatA, boatB);

// Get similarity score
const score = getBoatSimilarity(boatA, boatB);
```

## Directory Structure

- `/services` - Core business logic services
- `/utils` - Utility functions and helpers
- `/types` - Internal type definitions

## Dependencies

This package depends on:
- `@igorganapolsky/boats-types` - Shared type definitions

## License

MIT
