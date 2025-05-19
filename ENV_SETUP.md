# Multiple AI Provider Setup

This system now supports multiple AI providers. Follow the instructions below to set up the necessary API keys.

## Required API Keys for Deployment

When deploying to Vercel, you'll need to configure the following environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following environment variables:

| Name | Value | Description |
|------|-------|-------------|
| XAI_API_KEY | your_xai_api_key | **Required** - API key for xAI/Grok models |
| GOOGLE_GENERATIVE_AI_API_KEY | your_google_api_key | For Google Gemini models |
| GROQ_API_KEY | your_groq_api_key | For Groq models |
| COHERE_API_KEY | your_cohere_api_key | For Cohere models |

**Note:** The XAI_API_KEY is required for basic functionality. Other keys are optional but enable additional models.

## Local Development

For local development, add these same keys to your `.env.local` file:

```
# Default XAI API Key (Required)
XAI_API_KEY=your_xai_api_key

# Optional provider keys
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
GROQ_API_KEY=your_groq_api_key
COHERE_API_KEY=your_cohere_api_key
```

## Getting API Keys

### Google Gemini

1. Go to https://ai.google.dev/
2. Create a Google Cloud Project if you don't have one
3. Enable the Generative AI API
4. Create an API key
5. Copy the key to your `.env.local` file

### Groq

1. Go to https://console.groq.com/keys
2. Create an account or log in
3. Generate a new API key
4. Copy the key to your `.env.local` file

### Cohere

1. Go to https://dashboard.cohere.com/api-keys
2. Create an account or log in
3. Generate a new API key
4. Copy the key to your `.env.local` file

### Mistral

1. Go to https://console.mistral.ai/api-keys/
2. Create an account or log in
3. Generate a new API key
4. Copy the key to your `.env.local` file as `MISTRAL_API_KEY=your-key-here`

## Model Features

This system supports a variety of models with different capabilities:

### Google Gemini Models

- **Gemini 2.0 Flash**: Fast general purpose model with vision
- **Gemini 2.0 Flash Exp**: Experimental model with image generation
- **Gemini 2.0 Flash Thinking**: Enhanced thinking capabilities
- **Gemini 1.5 Pro**: Long context (1M tokens) with vision
- **Gemini 1.5 Flash**: Fast model with vision capabilities

### Groq Models

- **Llama 4 Scout**: Fast Llama model with vision capabilities
- **Gemma 2 9B**: Fast Gemma model for text tasks

### Cohere Models

- **Command R+**: Advanced reasoning model
- **Command R**: Reasoning-focused model
- **Command A**: General-purpose model

### Mistral Models

- **Pixtral 12B**: Multimodal model with document OCR for PDFs
- **Mistral Large**: Advanced reasoning for complex tasks
- **Mistral Small**: Efficient general-purpose model

For more information, see the [models.md](docs/models.md) file.
