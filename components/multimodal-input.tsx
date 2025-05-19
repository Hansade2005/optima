'use client';

import type { Attachment, UIMessage } from 'ai';
import cx from 'classnames';
import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { ArrowUpIcon, MicrophoneIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SuggestedActions } from './suggested-actions';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
// Import annyang 
import annyang from 'annyang';
// Use a type assertion to work around TypeScript issues
const annyangLib = annyang as any;
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import type { VisibilityType } from './visibility-selector';

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
  selectedVisibilityType,
}: {
  chatId: string;
  input: UseChatHelpers['input'];
  setInput: UseChatHelpers['setInput'];
  status: UseChatHelpers['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers['setMessages'];
  append: UseChatHelpers['append'];
  handleSubmit: UseChatHelpers['handleSubmit'];
  className?: string;
  selectedVisibilityType: VisibilityType;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const [isSpeechRecognitionSupported] = useState(() => Boolean(annyang));
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/chat/${chatId}`);

    // Stop any active speech recognition when submitting
    if (isListening && annyangLib) {
      annyangLib.abort();
      setIsListening(false);
    }

    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
    isListening,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  // Add listener for voice command to submit
  useEffect(() => {
    const handleVoiceSubmit = () => {
      if (input.trim() && status === 'ready') {
        submitForm();
      }
    };
    
    document.addEventListener('voice-submit', handleVoiceSubmit);
    
    return () => {
      document.removeEventListener('voice-submit', handleVoiceSubmit);
    };
  }, [input, status, submitForm]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute left-1/2 bottom-28 -translate-x-1/2 z-50"
          >
            <Button
              data-testid="scroll-to-bottom-button"
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={(event) => {
                event.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions
            append={append}
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
          />
        )}

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex flex-row gap-2 overflow-x-scroll items-end"
        >
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <Textarea
        data-testid="multimodal-input"
        ref={textareaRef}
        placeholder={isListening ? "Listening... Speak now" : "Send a message or click the microphone to speak..."}
        value={input}
        onChange={handleInput}
        className={cx(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700',
          isListening ? 'placeholder:text-red-500 dark:placeholder:text-red-400' : '',
          className,
        )}
        rows={2}
        autoFocus
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();

            if (status !== 'ready') {
              toast.error('Please wait for the model to finish its response!');
            } else {
              submitForm();
            }
          }
        }}
      />

      <div className="absolute bottom-0 p-2 w-fit flex flex-row justify-start gap-1">
        <AttachmentsButton fileInputRef={fileInputRef} status={status} />
        <VoiceInputButton setInput={setInput} status={status} isListening={isListening} setIsListening={setIsListening} />
      </div>

      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
        {status === 'submitted' ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton
            input={input}
            submitForm={submitForm}
            uploadQueue={uploadQueue}
          />
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  },
);

function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers['status'];
}) {
  return (
    <Button
      data-testid="attachments-button"
      className="rounded-md rounded-bl-lg p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={status !== 'ready'}
      variant="ghost"
    >
      <PaperclipIcon size={14} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers['setMessages'];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});

function PureVoiceInputButton({
  setInput,
  status,
  isListening,
  setIsListening,
}: {
  setInput: UseChatHelpers['setInput'];
  status: UseChatHelpers['status'];
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}) {
  const [listeningState, setListeningState] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [isSpeechRecognitionSupported] = useState(() => Boolean(annyang));

  // Initialize and cleanup annyang speech recognition
  useEffect(() => {
    // Check if annyang and browser speech recognition are supported
    if (!annyangLib) {
      return;
    }

    // Initialize annyang commands
    const commands: {[key: string]: () => void} = {
      'clear': () => {
        setInput('');
        toast.info('Input cleared');
      },
      'submit': () => {
        // Will need to access submitForm from parent component
        const submitEvent = new CustomEvent('voice-submit');
        document.dispatchEvent(submitEvent);
        toast.info('Submitting message');
      },
    };
    
    // Add the commands to annyang
    annyangLib.addCommands(commands);

    // Handle regular speech input
    annyangLib.addCallback('result', (phrases: string[]) => {
      if (phrases && phrases.length > 0) {
        // Use the most likely phrase (first one)
        const recognizedText = phrases[0].toLowerCase();
        
        // Check if it's a command (to avoid printing commands as text)
        if (recognizedText === 'clear' || recognizedText === 'submit') {
          // Commands will be handled by the commands object
          return;
        }
        
        // Append to existing input or set as new input
        setInput((currentInput) => {
          if (currentInput.trim()) {
            return `${currentInput.trim()} ${phrases[0]}`;
          }
          return phrases[0];
        });
        
        // Continue listening for more input
        setListeningState('listening');
      }
    });
    
    // Show interim results while speaking
    annyangLib.addCallback('soundstart', () => {
      setListeningState('listening');
    });
    
    annyangLib.addCallback('end', () => {
      if (isListening) {
        // If still in listening mode, restart
        try {
          annyangLib.start();
        } catch (error) {
          console.error('Failed to restart speech recognition:', error);
          setIsListening(false);
          setListeningState('idle');
        }
      }
    });

    annyangLib.addCallback('error', (error: any) => {
      console.error('Speech recognition error:', error);
      toast.error('Speech recognition failed. Please try again.');
      setIsListening(false);
      setListeningState('idle');
    });

    // Cleanup function
    return () => {
      if (annyangLib) {
        annyangLib.abort();
        annyangLib.removeCallback('result');
        annyangLib.removeCallback('error');
        annyangLib.removeCallback('soundstart');
        annyangLib.removeCallback('end');
      }
    };
  }, [setInput, isListening, setIsListening]);

  const toggleListening = () => {
    if (!annyangLib) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      // Stop listening
      annyangLib.abort();
      setIsListening(false);
      setListeningState('idle');
      toast.info('Voice input stopped');
    } else {
      // Start listening
      try {
        // Configure annyang options
        annyangLib.setLanguage('en-US'); // Set language to English
        annyangLib.start({ autoRestart: false, continuous: true });
        setIsListening(true);
        setListeningState('listening');
        toast.info('Listening for voice input...');
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        toast.error('Could not start speech recognition. Please check microphone permissions.');
        setIsListening(false);
        setListeningState('idle');
      }
    }
  };

  return (
    <Button
      data-testid="voice-input-button"
      className={`rounded-md p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200 ${
        isListening ? 'bg-red-100 dark:bg-red-900/20 text-red-500' : ''
      }`}
      onClick={(event) => {
        event.preventDefault();
        toggleListening();
      }}
      disabled={status !== 'ready' || !isSpeechRecognitionSupported}
      variant="ghost"
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
      title={isListening ? "Stop voice input" : "Start voice input (microphone) - Say 'clear' to clear input or 'submit' to send message"}
    >
      <AnimatePresence>
        {isListening ? (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: [1, 0.5, 1], 
              scale: [1, 1.2, 1] 
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <MicrophoneIcon size={14} />
          </motion.div>
        ) : (
          <MicrophoneIcon size={14} />
        )}
      </AnimatePresence>
    </Button>
  );
}

const VoiceInputButton = memo(PureVoiceInputButton);
