import { cn } from '@/lib/utils';

interface ModelBadgeProps {
  type: 'vision' | 'feature' | 'new' | 'provider' | 'context';
  children: React.ReactNode;
  className?: string;
}

// Color schemes for different badge types
const badgeStyles = {
  vision: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
  feature: 'bg-secondary text-secondary-foreground',
  new: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
  provider: 'bg-accent text-accent-foreground',
  context: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100',
};

export function ModelBadge({ type, children, className }: ModelBadgeProps) {
  return (
    <span 
      className={cn(
        'text-xs px-1.5 py-0.5 rounded-sm font-medium',
        badgeStyles[type],
        className
      )}
    >
      {children}
    </span>
  );
}

// Specialized badge for context size
export function ContextSizeBadge({ tokens }: { tokens: number }) {
  let formattedSize: string;
  
  if (tokens >= 1000000) {
    formattedSize = `${tokens / 1000000}M`;
  } else {
    formattedSize = `${Math.floor(tokens / 1000)}K`;
  }
  
  return (
    <ModelBadge type="context">
      {formattedSize}
    </ModelBadge>
  );
}
