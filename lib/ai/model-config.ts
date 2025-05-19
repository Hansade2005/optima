import { ChatModel } from './models';

export interface ModelOptions {
  // Common options
  temperature?: number;
  maxTokens?: number;
  
  // Gemini-specific options
  enableGrounding?: boolean;
  
  // Groq-specific options
  reasoningFormat?: 'parsed' | 'hidden' | 'raw';
  
  // Cohere-specific options
  preamble?: string;
  
  // Mistral-specific options
  safePrompt?: boolean;
}

export type ModelConfigMap = {
  [modelId: string]: ModelOptions;
};

// Default options for all models
const defaultOptions: ModelOptions = {
  temperature: 0.7,
  maxTokens: 4096,
};

// Default options per provider
const providerDefaults: Record<ChatModel['provider'], ModelOptions> = {
  xai: {
    temperature: 0.7,
    maxTokens: 4096,
  },
  google: {
    temperature: 0.7,
    maxTokens: 8192,
    enableGrounding: true,
  },  groq: {
    temperature: 0.7,
    maxTokens: 4096,
    reasoningFormat: 'parsed',
  },
  cohere: {
    temperature: 0.7,
    maxTokens: 4096,
  },
  mistral: {
    temperature: 0.7,
    maxTokens: 32000,
    safePrompt: false
  }
};

// Model-specific default options
const modelDefaults: ModelConfigMap = {
  // All Gemini models with grounded search enabled
  'google-gemini-2.0-flash-lite-preview-02-05': {
    enableGrounding: true,
  },
  'google-gemini-2.0-flash': {
    enableGrounding: true,
  },
  'google-gemini-2.0-flash-exp': {
    enableGrounding: true,
  },
  'google-gemini-2.0-flash-thinking': {
    temperature: 0.5,
    enableGrounding: true,
  },  'google-gemini-2.0-flash-thinking-1219': {
    temperature: 0.5,
    enableGrounding: true,
  },
  'google-gemini-1.5-pro': {
    enableGrounding: true,
  },
  // Mistral model-specific options
  'mistral-pixtral-12b': {
    temperature: 0.7,
    safePrompt: true,
  },
  'mistral-large': {
    temperature: 0.7,
    safePrompt: false,
  },
  'mistral-small': {
    temperature: 0.8, // Slightly higher temperature for more creative responses
    safePrompt: false,
  },
  'google-gemini-1.5-flash': {
    enableGrounding: true,
  },
  'groq-llama-4-scout': {
    reasoningFormat: 'parsed',
  },
  'cohere-command-r-plus': {
    temperature: 0.6,
  },
};

/**
 * Configure model options for a specific model ID
 * @param modelId The model ID to configure options for
 * @param options Custom options to override defaults
 * @returns The merged options for the model
 */
export function configureModelOptions(
  modelId: string, 
  options: ModelOptions = {}
): ModelOptions {
  const provider = modelId.split('-')[0] as ChatModel['provider'];
  
  // Merge options in order of specificity:
  // 1. Default options
  // 2. Provider default options
  // 3. Model-specific default options
  // 4. User-provided options
  return {
    ...defaultOptions,
    ...(provider ? providerDefaults[provider] : {}),
    ...(modelDefaults[modelId] || {}),
    ...options,
  };
}
