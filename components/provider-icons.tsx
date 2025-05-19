import { ReactNode } from 'react';

// Provider Icons 
export const XAIIcon = ({ className }: { className?: string }) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M12 2L2 19.5H22L12 2Z" 
      fill="currentColor" 
      opacity="0.8"
    />
  </svg>
);

export const GoogleIcon = ({ className }: { className?: string }) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M12 11V8L3 12.6L12 17.2V14.1C16 14.1 18.5 15.3 20 18C19 14 17 12 12 11Z" 
      fill="currentColor"
    />
  </svg>
);

export const GroqIcon = ({ className }: { className?: string }) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M5 5V19M19 5L12 12L19 19" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CohereIcon = ({ className }: { className?: string }) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3ZM12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7Z" 
      fill="currentColor"
      opacity="0.9"
    />
  </svg>
);

// Map of provider keys to icons
export const PROVIDER_ICONS: Record<string, ReactNode> = {
  xai: <XAIIcon className="mr-1.5 text-blue-600 dark:text-blue-400" />,
  google: <GoogleIcon className="mr-1.5 text-green-600 dark:text-green-400" />,
  groq: <GroqIcon className="mr-1.5 text-purple-600 dark:text-purple-400" />,
  cohere: <CohereIcon className="mr-1.5 text-amber-600 dark:text-amber-400" />,
};
