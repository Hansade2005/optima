# Multi-Provider AI Model Support

This document outlines how to set up and use multiple AI providers in OptimAI Chat.

## Supported Providers

The application now supports the following AI providers:

1. **Default (xAI)** - The default provider
2. **Google Gemini** - Google's Gemini models with advanced multimodal capabilities
3. **Groq** - High-speed model inference with reasoning capabilities
4. **Cohere** - Advanced language models optimized for specific tasks
5. **Mistral** - Advanced models with document OCR and vision capabilities

## Supported Models

### XAI Models (Default)
- **xai-grok-2-vision** - Primary model for all-purpose chat with vision capabilities
- **xai-grok-3-mini** - Mini model with advanced reasoning capabilities

### Google Gemini Models
#### Gemini 2.0 Series
- **gemini-2.0-flash** - Fast multimodal model with improved capabilities
- **gemini-2.0-flash-exp** - Experimental version of Gemini 2.0 Flash with image generation
- **gemini-2.0-flash-thinking-exp-01-21** - Experimental version with enhanced thinking capabilities

#### Gemini 1.5 Series
- **gemini-1.5-pro** - Versatile multimodal model with strong reasoning
- **gemini-1.5-flash** - Fast multimodal model for general-purpose use

### Groq Models
- **groq-gemma2-9b-it** - Fast Gemma model optimized for instruction following
- **groq-llama-4-scout** - High-performance Llama 4 Scout model with fast inference

### Mistral Models
- **mistral-pixtral-12b** - Multimodal model with vision capabilities and document OCR
- **mistral-large** - Flagship model for complex reasoning and general tasks  
- **mistral-small** - Efficient model for general-purpose text generation
- **groq-llama-4-scout** - High-performance Llama 4 Scout model with fast inference

### Cohere Models
- **cohere-command-r-plus** - Cohere's advanced reasoning model with tool usage capability
- **cohere-command-r** - Cohere's reasoning-focused model for general tasks
- **cohere-command-a-03** - Cohere's latest general-purpose model with enhanced capabilities

## Setup Instructions

### 1. Install Dependencies

The required packages should already be installed. If you need to install them manually, run:

```bash
pnpm add @ai-sdk/google @ai-sdk/groq @ai-sdk/cohere
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory of your project with your API keys:

```
# Google Generative AI API Key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# Groq API Key
GROQ_API_KEY=your_groq_api_key

# Cohere API Key
COHERE_API_KEY=your_cohere_api_key
```

You can obtain these API keys from:

- Google AI: https://ai.google.dev/
- Groq: https://console.groq.com/keys
- Cohere: https://dashboard.cohere.com/api-keys

### 3. Model Access by User Type

Model access is controlled by user type:

- **Guest Users**: Basic chat models (XAI models only)
- **Regular Users**: Basic chat models + Gemini 1.5 Flash, Groq Gemma 2, Cohere Command R
- **Premium Users**: All models (requires premium subscription)

## Using Different Models

### Google Gemini

Gemini models support:
- Multimodal inputs (text + images)
- Object generation
- Tool usage and streaming
- Image generation (Gemini 2.0 Flash Exp)
- Search grounding for up-to-date information

Example configuration for search grounding:

```typescript
import { configureModelOptions } from '@/lib/ai/model-config';

const providerOptions = configureModelOptions('google-gemini-2.0-flash', {
  enableGrounding: true
});
```

### Groq

Groq models focus on high-speed inference with select models supporting reasoning:

- Gemma 2 (9B): Fast general-purpose model
- Llama 4 Scout: Advanced reasoning with tool usage

For reasoning models, you can configure the reasoning format:

```typescript
const providerOptions = configureModelOptions('groq-llama-4-scout', {
  reasoningFormat: 'parsed'  // Options: 'parsed', 'hidden', 'raw'
});
```

### Mistral

Mistral models provide advanced capabilities:

- Pixtral 12B: Multimodal capabilities with document OCR for PDFs
- Mistral Large: Advanced reasoning and general tasks
- Mistral Small: Fast and efficient general-purpose text generation

For Mistral models, you can configure safety options:

```typescript
const providerOptions = configureModelOptions('mistral-pixtral-12b', {
  safePrompt: true  // Enable or disable safety prompt injection
});
```

For document OCR with Pixtral, files are automatically processed:

```typescript
// Document OCR is handled automatically when PDF files are uploaded
// The model will extract text and respond to queries about the document
```

### Model Feature Comparison

| Model | Context Size | Vision | Image Generation | Reasoning | Search Grounding | Document OCR |
|-------|--------------|--------|-----------------|-----------|-----------------|--------------|
| **gemini-2.0-flash** | 128K | ✅ | ❌ | ✅ | ✅ | ❌ |
| **gemini-2.0-flash-exp** | 128K | ✅ | ✅ | ✅ | ✅ | ❌ |
| **gemini-1.5-pro** | 1M | ✅ | ❌ | ✅ | ❌ | ❌ |
| **groq-llama-4-scout** | 128K | ✅ | ❌ | ✅ | ❌ | ❌ |
| **cohere-command-r-plus** | 128K | ❌ | ❌ | ✅ | ❌ | ❌ |
| **mistral-pixtral-12b** | 32K | ✅ | ❌ | ✅ | ❌ | ✅ |
| **mistral-large** | 32K | ❌ | ❌ | ✅ | ❌ | ❌ |
| **mistral-small** | 32K | ❌ | ❌ | ✅ | ❌ | ❌ |
