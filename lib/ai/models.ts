export const DEFAULT_CHAT_MODEL: string = 'xai-grok-2-vision';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
  provider: 'xai' | 'google' | 'groq' | 'cohere' | 'mistral';
  contextSize?: number;
  features?: string[];
  supportsImages?: boolean;
}

export const chatModels: Array<ChatModel> = [
  // XAI Models (Default)
  {
    id: 'xai-grok-2-vision',
    name: 'Grok 2 Vision',
    description: 'Primary model for all-purpose chat with vision capabilities',
    provider: 'xai',
    supportsImages: true,
  },
  {
    id: 'xai-grok-3-mini',
    name: 'Grok 3 Mini (Reasoning)',
    description: 'Uses advanced reasoning capabilities',
    provider: 'xai',
    supportsImages: false,
  },

  // Google Gemini Models
  // Gemini 2.0 Series
  {
    id: 'google-gemini-2.0-flash-lite-preview-02-05',
    name: 'Claude Sonnet 3.7',
    description: 'Advanced multimodal model with reasoning capabilities',
    provider: 'google',
    contextSize: 1000000,
    features: ['Search grounding', 'Object generation'],
    supportsImages: true,},
  {
    id: 'google-gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Fast multimodal model with improved capabilities',
    provider: 'google',
    contextSize: 128000,
    features: ['Search grounding', 'Object generation'],
    supportsImages: true,
  },
  {
    id: 'google-gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash Exp',
    description: 'Experimental model with image generation capabilities',
    provider: 'google',
    contextSize: 128000,
    features: ['Image generation', 'Search grounding'],
    supportsImages: true,
  },
  {
    id: 'google-gemini-2.0-flash-thinking',
    name: 'Gemini 2.0 Flash (Thinking)',
    description: 'Enhanced thinking capabilities for complex tasks',
    provider: 'google',
    contextSize: 128000,
    features: ['Enhanced thinking'],
    supportsImages: true,
  },
  {
    id: 'google-gemini-2.0-flash-thinking-1219',
    name: 'Gemini 2.0 Flash (Thinking 1219)',
    description: 'Enhanced thinking capabilities with improved model revision',
    provider: 'google',
    contextSize: 128000,
    features: ['Enhanced thinking', 'Search grounding'],
    supportsImages: true,
  },
  
  // Gemini 1.5 Series
  {
    id: 'google-gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Versatile multimodal model with strong reasoning',
    provider: 'google',
    contextSize: 1000000,
    supportsImages: true,
  },
  {
    id: 'google-gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast multimodal model for general-purpose use',
    provider: 'google',
    contextSize: 128000,
    supportsImages: true,
  },
  
  // Groq Models
  {
    id: 'groq-llama-4-scout',
    name: 'Llama 4 Scout (Groq)',
    description: 'High-performance Llama 4 with fast inference and image understanding',
    provider: 'groq',
    supportsImages: true,
  },
  {
    id: 'groq-gemma-2-9b',
    name: 'Gemma 2 9B (Groq)',
    description: 'Fast Gemma model optimized for instruction following',
    provider: 'groq',
    supportsImages: false,
  },
  
  // Cohere Models
  {
    id: 'cohere-command-r-plus',
    name: 'Command R+ (Cohere)',
    description: 'Advanced reasoning model with tool usage capability',
    provider: 'cohere',
    supportsImages: false,
  },
  {
    id: 'cohere-command-r',
    name: 'Command R (Cohere)',
    description: 'Reasoning-focused model for general tasks',
    provider: 'cohere',
    supportsImages: false,
  },
  {
    id: 'cohere-command-a',
    name: 'Command A (Cohere)',
    description: 'Latest general-purpose model with enhanced capabilities',
    provider: 'cohere',
    supportsImages: false,
  },
  
  // Mistral Models
  {
    id: 'mistral-pixtral-12b',
    name: 'Pixtral 12B',
    description: 'Multimodal model with vision capabilities and document OCR',
    provider: 'mistral',
    contextSize: 32000,
    features: ['Document OCR'],
    supportsImages: true,
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    description: 'Flagship model for complex reasoning and general tasks',
    provider: 'mistral',
    contextSize: 32000,
    supportsImages: false,
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    description: 'Efficient model for general-purpose text generation',
    provider: 'mistral',
    contextSize: 32000,
    supportsImages: false,
  },
];
