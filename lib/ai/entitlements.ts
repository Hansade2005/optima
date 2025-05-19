import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

// Base models available to all users
const baseModels = [
  'xai-grok-2-vision', 
  'xai-grok-3-mini'
];

// Basic models available to regular users (base models + some entry-level models)
const regularModels = [
  ...baseModels,
  'google-gemini-1.5-flash',
  'groq-gemma-2-9b',
  'cohere-command-r'
];

// All models available to premium users
const allModels = [
  ...regularModels,
  'google-gemini-2.0-flash',
  'google-gemini-2.0-flash-exp',
  'google-gemini-2.0-flash-thinking',
  'google-gemini-2.0-flash-thinking-1219',
  'google-gemini-1.5-pro',
  'groq-llama-4-scout',
  'cohere-command-r-plus',
  'cohere-command-a',
  'mistral-pixtral-12b',
  'mistral-large',
  'mistral-small'
];

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: baseModels,
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: regularModels,
  },

  /*
   * For users with an account and a paid membership
   */
  premium: {
    maxMessagesPerDay: 500,
    availableChatModelIds: allModels,
  },
};
