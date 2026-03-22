import { describe, expect, it, vi } from 'vitest';

import { AppError } from '../src/lib/errors.js';
import { TranslationService } from '../src/services/translation-service.js';
import type { Translator } from '../src/translators/types.js';

function createTranslator(name: 'llm' | 'nmt'): Translator {
  return {
    translate: vi.fn(async ({ text, sourceLanguage, targetLanguage }) => ({
      translatedText: `[${name}] ${sourceLanguage}->${targetLanguage}: ${text}`
    }))
  };
}

describe('TranslationService', () => {
  it('routes llm requests to the llm translator', async () => {
    const llm = createTranslator('llm');
    const nmt = createTranslator('nmt');
    const service = new TranslationService(
      { llm, nmt },
      { maxTranslationChars: 1000, chunkSizeChars: 200 }
    );

    const result = await service.translate({
      text: 'Hello',
      sourceLanguage: 'en',
      targetLanguage: 'uz',
      model: 'llm'
    });

    expect(llm.translate).toHaveBeenCalledOnce();
    expect(nmt.translate).not.toHaveBeenCalled();
    expect(result.model).toBe('llm');
  });

  it('rejects same-language translations', async () => {
    const service = new TranslationService(
      { llm: createTranslator('llm'), nmt: createTranslator('nmt') },
      { maxTranslationChars: 1000, chunkSizeChars: 200 }
    );

    await expect(
      service.translate({
        text: 'Salom',
        sourceLanguage: 'uz',
        targetLanguage: 'uz',
        model: 'nmt'
      })
    ).rejects.toMatchObject<AppError>({ code: 'INVALID_LANGUAGE_PAIR' });
  });

  it('combines translated chunks and exposes metadata for long text', async () => {
    const llm = createTranslator('llm');
    const service = new TranslationService(
      { llm, nmt: createTranslator('nmt') },
      { maxTranslationChars: 1000, chunkSizeChars: 20 }
    );

    const result = await service.translate({
      text: 'Hello world. Welcome here.',
      sourceLanguage: 'en',
      targetLanguage: 'uz',
      model: 'llm'
    });

    expect(llm.translate).toHaveBeenCalledTimes(2);
    expect(result.chunks).toBe(2);
    expect(result.translatedText).toContain('[llm] en->uz');
  });
});
