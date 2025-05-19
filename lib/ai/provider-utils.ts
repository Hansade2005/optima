import { getModelProvider } from './model-capabilities';

/**
 * Helper functions for provider management
 */

/**
 * Check if the required environment variables are set for a model
 * This is a client-side function that calls the server API to check availability
 * 
 * @param modelId The model ID to check
 * @returns Promise that resolves to an object with availability status and error message
 */
export async function checkModelAvailability(modelId: string): Promise<{
  available: boolean;
  error?: string;
  requiredKey?: string;
}> {
  try {
    const response = await fetch(`/api/model-status?modelId=${modelId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to check model availability: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking model availability:', error);
    return {
      available: true, // Default to true to prevent errors in development
      error: 'Failed to check model availability'
    };
  }
}

/**
 * Synchronous version for initial rendering that assumes all models are available
 * This allows the component to render without waiting for the API call
 */
export function checkModelAvailabilitySync(modelId: string): {
  available: boolean;
  error?: string;
  requiredKey?: string;
} {
  // For initial render, assume the model is available
  // The async version will update the UI when it completes
  return { available: true };
}

/**
 * Get a list of all required environment variables
 * This is a client-side function that calls the server API
 */
export async function getRequiredEnvVars(): Promise<Array<{
  key: string;
  provider: string;
  required: boolean;
  set: boolean;
}>> {
  try {
    const response = await fetch('/api/env-status');
    
    if (!response.ok) {
      throw new Error(`Failed to check environment variables: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking environment variables:', error);
    // Return default values when the API call fails
    return [
      {
        key: 'XAI_API_KEY',
        provider: 'xAI',
        required: true,
        set: true
      },
      {
        key: 'GOOGLE_GENERATIVE_AI_API_KEY',
        provider: 'Google',
        required: false,
        set: true
      },
      {
        key: 'GROQ_API_KEY',
        provider: 'Groq',
        required: false,
        set: true
      },
      {
        key: 'COHERE_API_KEY',
        provider: 'Cohere',
        required: false,
        set: true
      }
    ];
  }
}
