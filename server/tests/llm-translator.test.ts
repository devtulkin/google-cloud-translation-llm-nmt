import { describe, expect, it, vi } from 'vitest';

import { LlmTranslator } from '../src/translators/llm-translator.js';

describe('LlmTranslator', () => {
  it('sends only the source text to Translation LLM so instructions are not translated back', async () => {
    const translateText = vi.fn().mockResolvedValue([
      {
        translations: [
          {
            translatedText: 'Salom'
          }
        ]
      }
    ]);
    const client = { translateText } as never;
    const translator = new LlmTranslator('demo-project', 'global', client);

    await translator.translate({
      text: 'Hello',
      sourceLanguage: 'en',
      targetLanguage: 'uz'
    });

    expect(translateText).toHaveBeenCalledWith({
      parent: 'projects/demo-project/locations/global',
      contents: ['Hello'],
      mimeType: 'text/plain',
      sourceLanguageCode: 'en',
      targetLanguageCode: 'uz',
      model: 'projects/demo-project/locations/global/models/general/translation-llm'
    });
  });
});
