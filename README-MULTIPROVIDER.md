# Multi-Provider AI Model Support

This feature adds support for multiple AI providers in the OptimAI Chat application. Users can now select from a variety of AI models from different providers including:

- **XAI Grok** (Default provider)
- **Google Gemini**
- **Groq**
- **Cohere**

## Key Features

1. **Model Selection UI**: Enhanced model selector with provider grouping, model features, and badges for capabilities like vision support
2. **Provider Configuration**: Easy setup for multiple AI providers
3. **Tiered Access**: Different user types (guest, regular, premium) have access to different sets of models
4. **Warning System**: Warns users when a model is selected but its API key is not configured
5. **Compatibility with existing code**: Works with the existing AI SDK infrastructure

## Implementation Details

The implementation includes:

1. **Models Configuration**: Updated `models.ts` to include all supported models with their capabilities
2. **Provider Integration**: Updated `providers.ts` to connect to all supported AI providers
3. **Enhanced UI**: Created a new `EnhancedModelSelector` component for improved model selection
4. **Contextual Features**: Added capability detection to determine if a model supports images, reasoning, etc.
5. **Documentation**: Added setup instructions and model documentation

## Setup Instructions

1. Install additional AI SDK packages:
   ```bash
   pnpm add @ai-sdk/google @ai-sdk/groq @ai-sdk/cohere
   ```

2. Set up API keys in your `.env.local` file:
   ```
   # Google Generative AI API Key
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

   # Groq API Key
   GROQ_API_KEY=your_groq_api_key

   # Cohere API Key
   COHERE_API_KEY=your_cohere_api_key
   ```

3. Restart your development server to apply the changes.

## Supported Models

### Google Gemini
- **Gemini 2.0 Series**: Flash, Flash Exp, Flash Thinking
- **Gemini 1.5 Series**: Pro, Flash

### Groq
- **LLama 4 Scout**: Vision-capable model
- **Gemma 2 9B**: Fast Gemma model

### Cohere
- **Command R+**: Advanced reasoning
- **Command R**: General reasoning
- **Command A**: General purpose

## Known Limitations

1. Image generation is only supported by Gemini 2.0 Flash Exp model
2. Image input is not supported by Cohere models
3. Premium user type implementation requires additional authentication logic

## Admin Tools

We've added an admin page that allows premium users to check the status of their API keys:

- **API Key Status Page**: Available at `/admin` - shows the status of all provider API keys
- **Model Warning Banner**: Shows warnings when a model is selected but its API key is not configured
- **API Key Check Tool**: AI can use this tool to check if API keys are properly configured

## Development and Debugging

When developing with multiple providers:

1. Set up all API keys in your `.env.local` file
2. Use the admin page to verify that all keys are properly recognized
3. Try each model to ensure they're working as expected
4. If you encounter issues with a specific provider, check the model warnings and admin page

For detailed setup instructions, see the [ENV_SETUP.md](ENV_SETUP.md) file.
