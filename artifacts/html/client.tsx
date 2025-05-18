import { Artifact } from '@/components/create-artifact';
import { DocumentSkeleton } from '@/components/document-skeleton';
import {
  CopyIcon,
  CodeIcon,
  EyeIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons';
import { CodeEditor } from '@/components/code-editor';
import { toast } from 'sonner';
import { useState } from 'react';

interface HTMLContentProps {
  title: string;
  content: string;
  mode: 'edit' | 'diff';
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: 'streaming' | 'idle';
  suggestions: Array<any>;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  isInline: boolean;
  getDocumentContentById: (index: number) => string;
  isLoading: boolean;
  metadata: HTMLArtifactMetadata;
  setMetadata: (value: React.SetStateAction<HTMLArtifactMetadata>) => void;
}

interface HTMLArtifactMetadata {
  showPreview: boolean;
}

const HTMLContent = ({
  content,
  onSaveContent,
  isCurrentVersion,
  isLoading,
  metadata,
}: HTMLContentProps) => {
  if (isLoading) {
    return <DocumentSkeleton artifactKind="html" />;
  }

  if (!isCurrentVersion) {
    return (
      <div className="px-1">
        <CodeEditor
          content={content}
          status="idle"
          onSaveContent={() => {}}
          isCurrentVersion={false}
          isInline={false}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full h-full">
        {!metadata.showPreview ? (
          <div className="px-1">
            <CodeEditor
              content={content}
              status="idle"
              onSaveContent={(updatedContent) => onSaveContent(updatedContent, true)}
              isCurrentVersion={isCurrentVersion}
              isInline={false}
            />
          </div>
        ) : (
          <div className="w-full h-full p-4 bg-white">
            <iframe 
              srcDoc={content}
              className="w-full h-full border-none"
              title="HTML Preview"
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>
    </>
  );
};

export const htmlArtifact = new Artifact<'html', HTMLArtifactMetadata>({
  kind: 'html',
  description: 'Useful for creating HTML content with CSS and JavaScript',
  initialize: async ({ setMetadata }) => {
    setMetadata({
      showPreview: false,
    });
  },
  onStreamPart: ({ streamPart, setArtifact, setMetadata }) => {
    if (streamPart.type === 'html-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible:
          draftArtifact.status === 'streaming' &&
          draftArtifact.content.length > 300 &&
          draftArtifact.content.length < 310
            ? true
            : draftArtifact.isVisible,
        status: 'streaming',
      }));

      // Auto open preview when streaming is finished
      if (streamPart.type === 'finish') {
        setMetadata((metadata) => ({
          ...metadata,
          showPreview: true,
        }));
      }
    }

    if (streamPart.type === 'finish') {
      setMetadata((metadata) => ({
        ...metadata,
        showPreview: true,
      }));
    }
  },
  content: HTMLContent,
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CodeIcon size={18} />,
      description: 'View Code',
      onClick: ({ setMetadata }) => {
        setMetadata((metadata) => ({
          ...metadata,
          showPreview: false,
        }));
      },
      isDisabled: ({ metadata }) => {
        if (!metadata.showPreview) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <EyeIcon size={18} />,
      description: 'View Preview',
      onClick: ({ setMetadata }) => {
        setMetadata((metadata) => ({
          ...metadata,
          showPreview: true,
        }));
      },
      isDisabled: ({ metadata }) => {
        if (metadata.showPreview) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy HTML to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
      },
    },
  ],
  toolbar: [],
});
