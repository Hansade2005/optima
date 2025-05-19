declare namespace NodeJS {
  interface ProcessEnv {
    // xAI API Key
    XAI_API_KEY?: string;
    
    // Google Generative AI API Key
    GOOGLE_GENERATIVE_AI_API_KEY?: string;

    // Groq API Key
    GROQ_API_KEY?: string;

    // Cohere API Key
    COHERE_API_KEY?: string;
    // Mistral API Key
    MISTRAL_API_KEY?: string;
  }
}
