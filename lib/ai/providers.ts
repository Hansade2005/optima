import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { cohere } from '@ai-sdk/cohere';
import { mistral } from '@ai-sdk/mistral';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { chatModels } from './models';
import { configureModelOptions } from './model-config';

// Helper function to map our model IDs to provider-specific model IDs
function getProviderModelId(modelId: string): string {
  // Map our IDs to actual provider model IDs
  const modelMappings: Record<string, string> = {
    // XAI models
    'xai-grok-2-vision': 'grok-2-vision-1212',
    'xai-grok-3-mini': 'grok-3-mini-beta',
    
    // Google Gemini models
    'google-gemini-2.0-flash-lite-preview-02-05': 'gemini-2.0-flash-lite-preview-02-05',
    'google-gemini-2.0-flash': 'gemini-2.0-flash',
    'google-gemini-2.0-flash-exp': 'gemini-2.0-flash-exp',
    'google-gemini-2.0-flash-thinking': 'gemini-2.0-flash-thinking-exp-01-21',
    'google-gemini-2.0-flash-thinking-1219': 'gemini-2.0-flash-thinking-exp-01-1219',
    'google-gemini-1.5-pro': 'gemini-1.5-pro',
    'google-gemini-1.5-flash': 'gemini-1.5-flash',
    
    // Groq models
    'groq-llama-4-scout': 'llama-4-scout',
    'groq-gemma-2-9b': 'gemma2-9b-it',
    
    // Cohere models
    'cohere-command-r-plus': 'command-r-plus',
    'cohere-command-r': 'command-r',
    'cohere-command-a': 'command-a-03',
    
    // Mistral models
    'mistral-pixtral-12b': 'pixtral-12b-2409',
    'mistral-large': 'mistral-large-latest',
    'mistral-small': 'mistral-small-latest',
  };
  
  return modelMappings[modelId] || modelId;
}

// Create language and image model mappings for each provider
const languageModels: Record<string, any> = {};
const imageModels: Record<string, any> = {};

// Helper to create models for production
if (!isTestEnvironment) {
  // Process each model in our chat models list
  chatModels.forEach(model => {
    const providerModelId = getProviderModelId(model.id);
    const options = configureModelOptions(model.id);
    
    switch (model.provider) {
      case 'xai':
        if (model.id === 'xai-grok-3-mini') {
          languageModels[model.id] = wrapLanguageModel({
            model: xai(providerModelId),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
          });
        } else {
          languageModels[model.id] = xai(providerModelId);
        }
        break;
        
      case 'google':
        // For Google models, we'll use a config approach that respects the enableGrounding option
        if (model.id === 'google-gemini-2.0-flash-thinking' || model.id === 'google-gemini-2.0-flash-thinking-1219') {
          // Special handling for thinking models
          languageModels[model.id] = wrapLanguageModel({
            model: google(providerModelId, {
              // Enable search grounding based on the option
              useSearchGrounding: options.enableGrounding
            }),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
          });
        } else {
          // For all other Gemini models, apply grounding if enabled
          languageModels[model.id] = google(providerModelId, {
            // Enable search grounding based on the option
            useSearchGrounding: options.enableGrounding
          });
        }
        
        // For image generation, configure properly according to the docs
        // The model already supports image generation with proper response modalities
        if (model.id === 'google-gemini-2.0-flash-exp') {
          // Using standard model with responseModalities for image generation
          // The actual responseModalities will be set during generation
          imageModels[model.id] = google('gemini-2.0-flash-exp');
        }
        break;
        
      case 'groq':
        if (model.id === 'groq-llama-4-scout' && options.reasoningFormat === 'parsed') {
          languageModels[model.id] = wrapLanguageModel({
            model: groq(providerModelId),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
          });
        } else {
          languageModels[model.id] = groq(providerModelId);
        }
        break;
        
      case 'cohere':
        // Use a simplified configuration for Cohere models
        languageModels[model.id] = cohere(providerModelId);
        break;
        
      case 'mistral':
        // Use Mistral configuration with safety options based on model config
        languageModels[model.id] = mistral(providerModelId, {
          safePrompt: options.safePrompt
        });
        break;
    }
  });
}

// Legacy model mappings for backward compatibility
const legacyModelMappings = {
  'chat-model': 'xai-grok-2-vision',
  'chat-model-reasoning': 'xai-grok-3-mini',
  'title-model': 'xai-grok-2-vision',
  'artifact-model': 'xai-grok-2-vision',
};

// Create the main provider
export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        // Add all the new models
        ...languageModels,
        
        // Add legacy model mappings for backward compatibility
        'chat-model': languageModels[legacyModelMappings['chat-model']],
        'chat-model-reasoning': languageModels[legacyModelMappings['chat-model-reasoning']],
        'title-model': languageModels[legacyModelMappings['title-model']],
        'artifact-model': languageModels[legacyModelMappings['artifact-model']],
      },
      imageModels: {
        // Legacy image model
        'small-model': xai.image('grok-2-image'),
        
        // Add new image models
        ...imageModels,
      },
    });
