import { z } from 'zod';
import 'dotenv/config';

/**
 * Specify environment variables schema
 */
const envSchema = z.object({
  // Database
  POSTGRES_URL: z.string().min(1),

  // Auth
  AUTH_SECRET: z.string().min(1),
  
  // AI providers
  XAI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  COHERE_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  
  // Web search API
  TAVILY_API_KEY: z.string().optional(),
  
  // Payment providers
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PREMIUM_PRICE_ID: z.string().optional(),
  
  MESOMB_APP_KEY: z.string().optional(),
  MESOMB_API_KEY: z.string().optional(),
  MESOMB_ACCESS_KEY: z.string().optional(),
  
  // URL configs
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
});

/**
 * Parse environment variables
 */
export const env = envSchema.parse({
  POSTGRES_URL: process.env.POSTGRES_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
    // AI provider API keys
  XAI_API_KEY: process.env.XAI_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  COHERE_API_KEY: process.env.COHERE_API_KEY,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  
  // Web search API
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  
  // Payment providers
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID,
  
  MESOMB_APP_KEY: process.env.MESOMB_APP_KEY,
  MESOMB_API_KEY: process.env.MESOMB_API_KEY,
  MESOMB_ACCESS_KEY: process.env.MESOMB_ACCESS_KEY,
  
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

/**
 * Client-side environment variables
 */
export const clientEnv = {
  NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
};
