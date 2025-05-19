# Deploying OptimAI to Vercel

This guide will walk you through deploying OptimAI to Vercel with proper environment variable setup.

## Pre-Deployment Checklist

Before deploying to Vercel, make sure you have:

1. An account with each AI provider you plan to use:
   - xAI (required)
   - Google AI (optional)
   - Groq (optional)
   - Cohere (optional)
   - Mistral (optional)


2. API keys for each provider

## Deployment Steps

### 1. Fork or Clone the Repository

Make sure you have your own copy of the OptimAI repository.

### 2. Create a New Vercel Project

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your repository
4. Keep the default build settings

### 3. Configure Environment Variables

This is the most important step. Click on "Environment Variables" and add the following:

#### Required Variables:
- `XAI_API_KEY`: Your xAI API key (required for basic functionality)

#### Optional Variables (for additional models):
- `GOOGLE_GENERATIVE_AI_API_KEY`: For Google Gemini models
- `GROQ_API_KEY`: For Groq models
- `COHERE_API_KEY`: For Cohere models

### 4. Deploy

Click "Deploy" and wait for the build to complete.

### 5. Verify API Key Configuration

After deployment:
1. Navigate to the `/admin` route in your application
2. Verify that all required API keys are showing as configured

## Adding or Changing API Keys

If you need to update your API keys after deployment:
1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Edit or add the required variables
4. Redeploy your application

## Troubleshooting

If you encounter warning messages about missing API keys:
1. Check that you've added all required keys in your Vercel project settings
2. Make sure your API keys are correctly formatted
3. Redeploy the application after making changes

For further help, consult the [ENV_SETUP.md](ENV_SETUP.md) file for specific API key requirements.
