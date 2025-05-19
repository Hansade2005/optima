'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';

import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatModels } from '@/lib/ai/models';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { PROVIDER_ICONS } from './provider-icons';
import { ModelBadge, ContextSizeBadge } from './model-badge';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import type { Session } from 'next-auth';

// Group models by provider
function groupModelsByProvider(models: typeof chatModels) {
  return models.reduce((acc, model) => {
    const provider = model.provider || 'other';
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, typeof chatModels>);
}

export function EnhancedModelSelector({
  session,
  selectedModelId,
  className,
}: {
  session: Session;
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const userType = session.user.type;
  const { availableChatModelIds } = entitlementsByUserType[userType];

  const availableChatModels = chatModels.filter((chatModel) =>
    availableChatModelIds.includes(chatModel.id),
  );

  const selectedChatModel = useMemo(
    () =>
      availableChatModels.find(
        (chatModel) => chatModel.id === optimisticModelId,
      ),
    [optimisticModelId, availableChatModels],
  );

  const groupedModels = useMemo(
    () => groupModelsByProvider(availableChatModels),
    [availableChatModels],
  );

  // Provider display names
  const providerNames: Record<string, string> = {
    xai: 'xAI Grok',
    google: 'Google Gemini',
    groq: 'Groq',
    cohere: 'Cohere',
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="model-selector"
          variant="outline"
          className="md:px-2 md:h-[34px] flex items-center gap-1"
        >
          {selectedChatModel?.provider && PROVIDER_ICONS[selectedChatModel.provider]}
          <span className="max-w-[120px] truncate">{selectedChatModel?.name}</span>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[320px] max-h-[450px] overflow-y-auto">
        {Object.entries(groupedModels).map(([provider, models]) => (
          <div key={provider}>            <DropdownMenuLabel className="flex items-center">
              {PROVIDER_ICONS[provider]}
              <span>{providerNames[provider] || provider}</span>
              {provider === "google" && (
                <ModelBadge type="new" className="ml-2">New</ModelBadge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {models.map((chatModel) => {
                const { id } = chatModel;
                const isSelected = id === optimisticModelId;

                return (
                  <DropdownMenuItem
                    data-testid={`model-selector-item-${id}`}
                    key={id}
                    onSelect={() => {
                      setOpen(false);

                      startTransition(() => {
                        setOptimisticModelId(id);
                        saveChatModelAsCookie(id);
                      });
                    }}
                    data-active={isSelected}
                    asChild
                  >
                    <button
                      type="button"
                      className="gap-4 group/item flex flex-row justify-between items-start w-full p-2"
                    >
                      <div className="flex flex-col gap-1 items-start">                          <div className="flex items-center gap-1">
                          <span>{chatModel.name}</span>
                          {chatModel.supportsImages && (
                            <ModelBadge type="vision">Vision</ModelBadge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {chatModel.description}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {chatModel.features && chatModel.features.length > 0 && (
                            chatModel.features.map(feature => (
                              <ModelBadge key={feature} type="feature">{feature}</ModelBadge>
                            ))
                          )}
                          {chatModel.contextSize && (
                            <ContextSizeBadge tokens={chatModel.contextSize} />
                          )}
                        </div>
                      </div>

                      <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                        <CheckCircleFillIcon />
                      </div>
                    </button>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </div>
        ))}

        {userType !== "premium" && (
          <div className="p-2 text-xs text-muted-foreground bg-muted rounded-md m-2">
            <p className="font-medium mb-1">Upgrade to unlock more models</p>
            <p>Premium users get access to all models including the latest Gemini 2.0 Flash, Groq LLama 4, and more.</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
