# Boats.com Shared Packages

This document provides guidelines for working with the Boats.com shared packages.

## Available Packages

1. **@igorganapolsky/boats-core** - Core business logic and utilities
2. **@igorganapolsky/boats-hooks** - React hooks for application state management
3. **@igorganapolsky/boats-api** - API client services 
4. **@igorganapolsky/boats-types** - Shared TypeScript types

## Setup for Development

### Local Development

For local development, you can reference the packages using file paths:

```json
"dependencies": {
  "@igorganapolsky/boats-core": "file:../boats-shared-packages/packages/core",
  "@igorganapolsky/boats-hooks": "file:../boats-shared-packages/packages/hooks",
  "@igorganapolsky/boats-api": "file:../boats-shared-packages/packages/api",
  "@igorganapolsky/boats-types": "file:../boats-shared-packages/packages/types"
}
```

### GitHub Packages Integration

For production use, use the published GitHub packages:

1. Create a `.npmrc` file in your project with:

```
@igorganapolsky:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

2. Add the token to your environment variables or CI/CD pipeline.

3. Add dependencies to your `package.json`:

```json
"dependencies": {
  "@igorganapolsky/boats-core": "^0.1.0",
  "@igorganapolsky/boats-hooks": "^0.1.0",
  "@igorganapolsky/boats-api": "^0.1.0",
  "@igorganapolsky/boats-types": "^0.1.0"
}
```

## GitHub Token Setup

1. Generate a Personal Access Token with `read:packages` and `write:packages` scopes at https://github.com/settings/tokens/new

2. Configure npm to use the token:

```bash
export GITHUB_TOKEN=your_token_here
```

Or add to your shell profile:

```bash
echo 'export GITHUB_TOKEN=your_token_here' >> ~/.zshrc
```

## Mobile App Integration

These packages are designed to work with React Native:

1. Install in your React Native project:

```bash
yarn add @igorganapolsky/boats-core @igorganapolsky/boats-types
```

2. For React-specific packages:

```bash
yarn add @igorganapolsky/boats-hooks
```

3. Import in your code:

```typescript
// Import types
import { Boat } from '@igorganapolsky/boats-types';

// Import core functionality
import { boatComparisonService } from '@igorganapolsky/boats-core';

// Import hooks (React/React Native only)
import { useBoatComparison } from '@igorganapolsky/boats-hooks';
```

## Publishing Updates

Updates are automatically published when changes are pushed to the main branch. To manually publish:

1. Bump the version in the package's `package.json`
2. Commit and push changes
3. The GitHub Actions workflow will handle the rest

## Troubleshooting

- If you encounter authentication issues, regenerate your GitHub token
- For local development issues, try `yarn clean` followed by `yarn build` in each package
