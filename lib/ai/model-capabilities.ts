import { chatModels, ChatModel } from './models';

/**
 * Helper functions to determine model capabilities
 */

/**
 * Checks if a model supports image inputs
 * @param modelId The model ID to check
 * @returns Boolean indicating whether the model supports image inputs
 */
export function supportsImages(modelId: string): boolean {
  const model = chatModels.find(m => m.id === modelId);
  return model?.supportsImages === true;
}

/**
 * Checks if a model supports image generation
 * @param modelId The model ID to check
 * @returns Boolean indicating whether the model supports image generation
 */
export function supportsImageGeneration(modelId: string): boolean {
  return modelId === 'google-gemini-2.0-flash-exp';
}

/**
 * Gets the model provider
 * @param modelId The model ID to check
 * @returns The provider of the model
 */
export function getModelProvider(modelId: string): ChatModel['provider'] | undefined {
  const model = chatModels.find(m => m.id === modelId);
  return model?.provider;
}

/**
 * Checks if a model supports search grounding
 * @param modelId The model ID to check
 * @returns Boolean indicating whether the model supports search grounding
 */
export function supportsSearchGrounding(modelId: string): boolean {
  const model = chatModels.find(m => m.id === modelId);
  return model?.features?.includes('Search grounding') === true;
}

/**
 * Checks if a model supports advanced reasoning via reasoning middleware
 * @param modelId The model ID to check
 * @returns Boolean indicating whether the model uses reasoning middleware
 */
export function usesReasoningMiddleware(modelId: string): boolean {
  return ['xai-grok-3-mini', 'google-gemini-2.0-flash-thinking', 'google-gemini-2.0-flash-thinking-1219', 'groq-llama-4-scout'].includes(modelId);
}

/**
 * Checks if a model supports document OCR capabilities
 * @param modelId The model ID to check
 * @returns Boolean indicating whether the model supports document OCR
 */
export function supportsDocumentOCR(modelId: string): boolean {
  const model = chatModels.find(m => m.id === modelId);
  return model?.features?.includes('Document OCR') === true;
}
