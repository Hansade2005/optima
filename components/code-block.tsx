'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useTheme } from 'next-themes';
import { CheckIcon, CopyIcon } from './icons';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  
  // Extract the language from className (format: language-xxx)
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  
  // Handle copy functionality
  const handleCopy = async () => {
    if (typeof children === 'string') {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!inline) {
    return (
      <div className="not-prose flex flex-col relative">
        <div className="absolute right-2 top-2 z-10">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md bg-zinc-700/50 hover:bg-zinc-700 text-zinc-100 transition-colors"
            aria-label={copied ? "Copied!" : "Copy code"}
            title={copied ? "Copied!" : "Copy code"}
          >
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          </button>
        </div>
        
        {language ? (
          <SyntaxHighlighter
            {...props}
            language={language}
            style={theme === 'dark' ? oneDark : oneLight}
            customStyle={{
              margin: 0,
              borderRadius: '0.75rem',
              padding: '1rem',
              fontSize: '0.875rem',
              border: theme === 'dark' ? '1px solid rgb(63 63 70)' : '1px solid rgb(228 228 231)'
            }}
            PreTag="div"
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <pre
            {...props}
            className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900`}
          >
            <code className="whitespace-pre-wrap break-words">{children}</code>
          </pre>
        )}
      </div>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
