# Integrating with Expo Mobile Apps

This guide explains how to use these shared packages in your Expo mobile app with AWS CodeBuild and Fastlane.

## Direct Integration Method

For direct integration with an Expo mobile app:

```bash
# From your Expo project root
npm install @boats/core @boats/hooks
```

Then import and use the packages in your React Native components:

```javascript
import { OpenAIService } from '@boats/core';
import { useBoatComparison } from '@boats/hooks';

// Your component code...
```

## AWS CodeBuild with Fastlane Integration

For CI/CD with AWS CodeBuild and Fastlane, follow these steps:

### 1. Set Up Your AWS CodeBuild Project

1. Create a new CodeBuild project in the AWS Console
2. Connect it to your GitHub repository
3. Use the provided `buildspec.yml` from this repository
4. Configure environment variables (OPENAI_API_KEY, etc.)

### 2. Configure Fastlane

1. Copy the example Fastfile to your Expo mobile app repository
2. Modify as needed for your specific project structure
3. Set up the necessary credentials for iOS/Android deployment

### 3. Build Pipeline

The build process will:
1. Build the shared packages
2. Create npm tarballs of the packages
3. Pass these as artifacts to Fastlane
4. Fastlane will install the packages in your mobile app
5. Build and deploy your mobile app to TestFlight/Play Store

## Example App Structure

Your Expo app should have a structure like:

```
expo-boats-app/
├── App.js
├── app.json
├── assets/
├── babel.config.js
├── components/
├── metro.config.js  <- Configure this for local development
├── package.json
└── fastlane/
    └── Fastfile
```

## Metro Configuration for Local Development

Create a `metro.config.js` file in your Expo project:

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// For local package development
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  // Add path to local packages if needed for development
  // path.resolve(__dirname, '../boats-packages/boats-core'),
];

module.exports = config;
```

## AWS Amplify Integration (Optional)

If you're using AWS Amplify for authentication or other services:

```javascript
import { Auth } from 'aws-amplify';
import { OpenAIService } from '@boats/core';

// Initialize OpenAI service with authenticated credentials
const initializeServices = async () => {
  const session = await Auth.currentSession();
  const token = session.getIdToken().getJwtToken();
  
  const openai = new OpenAIService({
    apiKey: token, // Use token from Amplify Auth
    baseURL: 'https://your-api-gateway-url.amazonaws.com/stage'
  });
  
  return { openai };
};
```
