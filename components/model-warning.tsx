'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WarningIcon } from './icons';
import { checkModelAvailability, checkModelAvailabilitySync } from '@/lib/ai/provider-utils';
import { Button } from './ui/button';
import { chatModels } from '@/lib/ai/models';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function ModelWarning({ modelId }: { modelId: string }) {
  // Initial state from sync function for fast rendering
  const initialAvailability = checkModelAvailabilitySync(modelId);
  const [modelAvailability, setModelAvailability] = useState(initialAvailability);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function checkAvailability() {
      try {
        const availability = await checkModelAvailability(modelId);
        setModelAvailability(availability);
      } catch (error) {
        console.error('Error checking model availability:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAvailability();
  }, [modelId]);
  
  // If model is available, still checking, or we're in production, don't show the warning
  if (modelAvailability.available || isLoading) {
    return null;
  }
  
  const model = chatModels.find(model => model.id === modelId);
  const modelName = model?.name || modelId;
  const providerName = model?.provider?.toUpperCase() || 'AI provider';  return (
    <Alert variant="warning" className="my-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
      <div className="h-4 w-4 text-amber-600 dark:text-amber-400">
        <WarningIcon size={16} />
      </div>
      <AlertTitle className="text-amber-800 dark:text-amber-200">API Key Missing</AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        <p className="mb-2">
          The selected model <strong>{modelName}</strong> requires a {providerName} API key
          but none is configured. Some features may not work correctly.
        </p>
        <p className="text-sm mb-3">
          Required environment variable: <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">{modelAvailability.requiredKey}</code>
        </p>        <Button variant="outline" className="text-amber-800 border-amber-300 dark:border-amber-700 dark:text-amber-200" asChild>
          <Link href="/admin" target="_blank">
            View Setup Instructions
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
