import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { svgPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';

export const svgDocumentHandler = createDocumentHandler<'svg'>({
  kind: 'svg',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: svgPrompt,
      prompt: title,
      schema: z.object({
        svg: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { svg } = object;

        if (svg) {
          dataStream.writeData({
            type: 'svg-delta',
            content: svg ?? '',
          });

          draftContent = svg;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'svg'),
      prompt: description,
      schema: z.object({
        svg: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { svg } = object;

        if (svg) {
          dataStream.writeData({
            type: 'svg-delta',
            content: svg ?? '',
          });

          draftContent = svg;
        }
      }
    }

    return draftContent;
  },
});