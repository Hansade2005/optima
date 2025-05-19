 'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { getRequiredEnvVars } from '@/lib/ai/provider-utils';

export default function AdminPage() {
  const [envVars, setEnvVars] = useState<Array<{
    key: string;
    provider: string;
    required: boolean;
    set: boolean;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEnvStatus() {
      try {
        const data = await getRequiredEnvVars();
        setEnvVars(data);
      } catch (err) {
        setError('Failed to load environment status');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchEnvStatus();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">API Key Configuration</h1>
      <p className="text-muted-foreground mb-6">
        This page shows the status of required API keys for different AI providers.
        For production deployment on Vercel, configure these in your project settings.
      </p>
      
      {loading && <p className="text-muted-foreground">Loading configuration...</p>}
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {envVars.map(env => (
          <Card key={env.key} className={env.set ? 'border-green-300' : env.required ? 'border-red-300' : 'border-amber-300'}>
            <CardHeader>
              <div className="flex justify-between items-center">                <CardTitle className="font-mono text-sm">{env.key}</CardTitle>
                {env.set ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className={`h-6 w-6 ${env.required ? 'text-red-500' : 'text-amber-500'}`} />
                )}
              </div>
              <CardDescription>Provider: {env.provider}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Status: 
                {env.set ? (
                  <span className="text-green-600 ml-2">Configured</span>
                ) : env.required ? (
                  <span className="text-red-600 ml-2">Required but not set</span>
                ) : (
                  <span className="text-amber-600 ml-2">Optional but not set</span>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 bg-muted p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Configuration Instructions</h2>
        <p className="mb-4">
          Set these environment variables in your <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">.env.local</code> file to enable all models.
        </p>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm">
{`# xAI API Key
XAI_API_KEY=your_xai_api_key

# Google Generative AI API Key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# Groq API Key
GROQ_API_KEY=your_groq_api_key

# Cohere API Key
COHERE_API_KEY=your_cohere_api_key`}
        </pre>
      </div>
    </div>
  );
}
