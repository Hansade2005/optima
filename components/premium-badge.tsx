'use client';

import { useSession } from 'next-auth/react';
import { Badge } from './ui/badge';
import { Sparkles } from 'lucide-react';

export function PremiumBadge() {
  const { data: session } = useSession();
  
  if (session?.user?.type !== 'premium') {
    return null;
  }
  
  return (
    <Badge variant="premium" className="flex gap-1.5 items-center">
      <Sparkles className="h-3.5 w-3.5" />
      Premium
    </Badge>
  );
}
