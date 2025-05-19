import { NextResponse } from 'next/server';
import { getModelProvider } from '@/lib/ai/model-capabilities';
import { auth } from '@/app/(auth)/auth';

export async function GET(request: Request) {
  // Make sure the user is authenticated
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get('modelId');

  if (!modelId) {
    return NextResponse.json(
      { error: 'Missing modelId parameter' },
      { status: 400 }
    );
  }

  const provider = getModelProvider(modelId);
  
  if (!provider) {
    return NextResponse.json(
      { 
        available: false, 
        error: 'Unknown model provider' 
      }
    );
  }
  
  // Check if the required API key is set
  let available = false;
  let error = '';
  let requiredKey = '';
  
  switch (provider) {
    case 'xai':
      available = !!process.env.XAI_API_KEY;
      error = available ? '' : 'XAI API key not set';
      requiredKey = 'XAI_API_KEY';
      break;
      
    case 'google':
      available = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      error = available ? '' : 'Google Generative AI API key not set';
      requiredKey = 'GOOGLE_GENERATIVE_AI_API_KEY';
      break;
      
    case 'groq':
      available = !!process.env.GROQ_API_KEY;
      error = available ? '' : 'Groq API key not set';
      requiredKey = 'GROQ_API_KEY';
      break;
      
    case 'cohere':
      available = !!process.env.COHERE_API_KEY;
      error = available ? '' : 'Cohere API key not set';
      requiredKey = 'COHERE_API_KEY';
      break;
  }
  
  return NextResponse.json({
    available,
    error: error || undefined,
    requiredKey: available ? undefined : requiredKey,
    provider
  });
}
