import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

// All available models for both guest and regular users
const allModels = [
  'xai-grok-2-vision',
  'xai-grok-3-mini',
  'google-gemini-2.0-flash-lite-preview-02-05',
  'google-gemini-2.0-flash',
  'google-gemini-2.0-flash-exp',
  'google-gemini-2.0-flash-thinking',
  'google-gemini-2.0-flash-thinking-1219',
  'google-gemini-1.5-pro',
  'google-gemini-1.5-flash',
  'groq-llama-4-scout',
  'groq-gemma-2-9b',
  'cohere-command-r-plus',
  'cohere-command-r',
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
    maxMessagesPerDay: 20, // Limited to 20 messages
    availableChatModelIds: allModels,
  },

  /*
   * For users with an account - unlimited messages
   */
  regular: {
    maxMessagesPerDay: Number.MAX_SAFE_INTEGER, // Unlimited messages
    availableChatModelIds: allModels,
  },
};
