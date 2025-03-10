# @igorganapolsky/boats-api

API client services for Boats.com applications.

## Installation

```bash
npm install @igorganapolsky/boats-api
# or
yarn add @igorganapolsky/boats-api
```

## Features

- Authentication API client
- Boat API client
- Analytics API client
- API configuration helpers

## Usage

```typescript
import { BoatService } from '@igorganapolsky/boats-api';

// Fetch boat data
async function fetchBoat(id: string) {
  const boat = await BoatService.getBoatById(id);
  return boat;
}

// Search for boats
async function searchBoats(query: string) {
  const results = await BoatService.search(query);
  return results;
}
```

## Configuration

The API clients can be configured globally:

```typescript
import { configureApi } from '@igorganapolsky/boats-api';

configureApi({
  baseUrl: 'https://api.boats.com',
  apiKey: 'your-api-key',
  timeout: 5000
});
```

## Dependencies

This package depends on:
- `@igorganapolsky/boats-core` - Core business logic
- `@igorganapolsky/boats-types` - Shared type definitions

## License

MIT
