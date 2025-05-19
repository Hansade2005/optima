import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';

export async function GET() {
  // Make sure the user is authenticated
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only return environment status to authenticated users
  const envStatus = [
    {
      key: 'XAI_API_KEY',
      provider: 'xAI',
      required: true,
      set: !!process.env.XAI_API_KEY
    },
    {
      key: 'GOOGLE_GENERATIVE_AI_API_KEY',
      provider: 'Google',
      required: false,
      set: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    },
    {
      key: 'GROQ_API_KEY',
      provider: 'Groq',
      required: false,
      set: !!process.env.GROQ_API_KEY
    },
    {
      key: 'COHERE_API_KEY',
      provider: 'Cohere',
      required: false,
      set: !!process.env.COHERE_API_KEY
    }
  ];

  return NextResponse.json(envStatus);
}
