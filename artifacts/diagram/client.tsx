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
import { useState, useEffect, useRef } from 'react';

// Custom styles for diagram rendering
const diagramStyles = `
.diagram-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.diagram-container svg {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

.diagram-container .error {
  color: red;
  padding: 1rem;
  border: 1px solid red;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.mermaid {
  text-align: center;
}
`;

interface DiagramContentProps {
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
  metadata: DiagramArtifactMetadata;
  setMetadata: (value: React.SetStateAction<DiagramArtifactMetadata>) => void;
}

interface DiagramArtifactMetadata {
  showPreview: boolean;
  diagramType: 'mermaid' | 'nomnoml' | 'code';
}

const DiagramContent = ({
  content,
  onSaveContent,
  isCurrentVersion,
  isLoading,
  metadata,
  setMetadata,
}: DiagramContentProps) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [renderedContent, setRenderedContent] = useState<string>('');

  useEffect(() => {
    // Load external scripts when showing preview
    if (metadata.showPreview) {      const detectDiagramType = (content: string): 'mermaid' | 'nomnoml' | 'code' => {
        // Check for mermaid syntax markers
        const mermaidMarkers = [
          '```mermaid', 'graph ', 'flowchart ', 'sequenceDiagram', 'classDiagram', 
          'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie'
        ];
        
        const contentLower = content.toLowerCase().trim();
        
        // Check for mermaid syntax
        if (mermaidMarkers.some(marker => contentLower.includes(marker.toLowerCase()))) {
          return 'mermaid';
        } 
        // Check for nomnoml syntax (brackets with content inside)
        else if (content.includes('[') && content.includes(']') && 
                /\[[^\[\]]+\]/.test(content)) {
          return 'nomnoml';
        }
        
        return 'code';
      };
      
      const diagramType = detectDiagramType(content);
      setMetadata(prev => ({ ...prev, diagramType }));
        // Clean content to remove markdown code blocks
      let cleanContent = content;
      if (content.includes('```')) {
        // Handle multiline code blocks with language specification
        cleanContent = content
          .replace(/```(?:mermaid|nomnoml|diagram)?[\r\n]+([\s\S]+?)```/g, '$1')
          .trim();
        
        // If the replacement didn't work (maybe single line), try simpler approach
        if (cleanContent === content) {
          cleanContent = content
            .replace(/```mermaid|```nomnoml|```diagram|```/g, '')
            .trim();
        }
      }
        if (diagramType === 'mermaid') {
        // Load mermaid script if not already loaded
        if (typeof window.mermaid === 'undefined') {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
          script.onload = () => {
            if (window.mermaid) {              window.mermaid.initialize({ startOnLoad: true, securityLevel: 'loose' });
              const element = previewContainerRef.current;
              if (element) {
                element.innerHTML = `<div class="mermaid">${cleanContent}</div>`;
                try {
                  window.mermaid.init(undefined, element.querySelectorAll('.mermaid'));
                } catch (e: unknown) {
                  const errorMessage = e instanceof Error ? e.message : 'Unknown error';
                  element.innerHTML = `<div class="error">Error rendering diagram: ${errorMessage}</div>`;
                }
              }
            }
          };
          document.head.appendChild(script);
        } else {          const element = previewContainerRef.current;
          if (element && window.mermaid) {
            element.innerHTML = `<div class="mermaid">${cleanContent}</div>`;
            try {
              window.mermaid.init(undefined, element.querySelectorAll('.mermaid'));
            } catch (e: unknown) {
              const errorMessage = e instanceof Error ? e.message : 'Unknown error';
              element.innerHTML = `<div class="error">Error rendering diagram: ${errorMessage}</div>`;
            }
          }
        }} else if (diagramType === 'nomnoml') {
        // Load nomnoml script if not already loaded
        if (typeof window.nomnoml === 'undefined') {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/nomnoml@1.7.0/dist/nomnoml.min.js';
          script.onload = () => {
            if (window.nomnoml) {              const element = previewContainerRef.current;
              if (element) {
                try {
                  const svg = window.nomnoml.renderSvg(cleanContent);
                  element.innerHTML = svg;
                } catch (e: unknown) {
                  const errorMessage = e instanceof Error ? e.message : 'Unknown error';
                  element.innerHTML = `<div class="error">Error rendering diagram: ${errorMessage}</div>`;
                }
              }
            }
          };
          document.head.appendChild(script);
        } else {          const element = previewContainerRef.current;
          if (element && window.nomnoml) {
            try {
              const svg = window.nomnoml.renderSvg(cleanContent);
              element.innerHTML = svg;
            } catch (e: unknown) {
              const errorMessage = e instanceof Error ? e.message : 'Unknown error';
              element.innerHTML = `<div class="error">Error rendering diagram: ${errorMessage}</div>`;
            }
          }
        }
      }
    }
  }, [metadata.showPreview, content, setMetadata]);

  if (isLoading) {
    return <DocumentSkeleton artifactKind="diagram" />;
  }

  if (!isCurrentVersion) {    
    return (
      <div className="px-1">
        <CodeEditor
          content={content}
          status="idle"
          onSaveContent={() => {}}
          isCurrentVersion={false}
          currentVersionIndex={0}
          suggestions={[]}
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
              currentVersionIndex={0}
              suggestions={[]}
            />
          </div>
        ) : (          <div className="w-full h-full p-4 bg-white overflow-auto">
            <style dangerouslySetInnerHTML={{ __html: diagramStyles }} />
            <div ref={previewContainerRef} className="diagram-container" />
          </div>
        )}
      </div>
    </>
  );
};

// Need to declare global types for the dynamically loaded libraries
declare global {
  interface Window {
    mermaid?: {
      initialize: (config: any) => void;
      init: (config: any, nodes: NodeListOf<Element>) => void;
    };
    nomnoml?: {
      renderSvg: (source: string) => string;
    };
  }
}

export const diagramArtifact = new Artifact<'diagram', DiagramArtifactMetadata>({
  kind: 'diagram',
  description: 'Create diagrams using Mermaid or Nomnoml syntax',
  initialize: async ({ setMetadata }) => {
    setMetadata({
      showPreview: false,
      diagramType: 'code',
    });
  },
  onStreamPart: ({ streamPart, setArtifact, setMetadata }) => {
    if (streamPart.type === 'diagram-delta' as any) {
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
    }

    if (streamPart.type === 'finish') {
      setMetadata((metadata) => ({
        ...metadata,
        showPreview: true,
      }));
    }
  },
  content: DiagramContent,
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
      description: 'Copy diagram code to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
      },
    },
  ],
  toolbar: [],
});
