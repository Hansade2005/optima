import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { diagramPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';

export const diagramDocumentHandler = createDocumentHandler<'diagram'>({
  kind: 'diagram',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: diagramPrompt,
      prompt: title,
      schema: z.object({
        diagram: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { diagram } = object;

        if (diagram) {
          dataStream.writeData({
            type: 'diagram-delta',
            content: diagram ?? '',
          });

          draftContent = diagram;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'diagram'),
      prompt: description,
      schema: z.object({
        diagram: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { diagram } = object;

        if (diagram) {
          dataStream.writeData({
            type: 'diagram-delta',
            content: diagram ?? '',
          });

          draftContent = diagram;
        }
      }
    }

    return draftContent;
  },
});
