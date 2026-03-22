import { performance } from 'node:perf_hooks';

import { chunkText } from '../lib/chunking.js';
import { AppError } from '../lib/errors.js';
import type { TranslateRequest, TranslateResponse } from '../types.js';
import type { Translator } from '../translators/types.js';

type TranslationServiceOptions = {
  maxTranslationChars: number;
  chunkSizeChars: number;
};

type Translators = {
  llm: Translator;
  nmt: Translator;
};

export class TranslationService {
  private readonly translators: Translators;
  private readonly options: TranslationServiceOptions;

  constructor(translators: Translators, options: TranslationServiceOptions) {
    this.translators = translators;
    this.options = options;
  }

  async translate(request: TranslateRequest): Promise<TranslateResponse> {
    this.validateRequest(request);

    const startedAt = performance.now();
    const chunks = chunkText(request.text, this.options.chunkSizeChars);
    const translator = this.translators[request.model];

    const translatedParts = [];
    let detectedSourceLanguage: string | undefined;

    for (const chunk of chunks) {
      const result = await translator.translate({
        text: chunk,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage
      });

      translatedParts.push(result.translatedText);
      detectedSourceLanguage ??= result.detectedSourceLanguage;
    }

    const latencyMs = Math.round(performance.now() - startedAt);
    console.info('translation_completed', {
      model: request.model,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      chunks: chunks.length,
      latencyMs
    });

    return {
      translatedText: translatedParts.join('\n\n'),
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      model: request.model,
      detectedSourceLanguage,
      chunks: chunks.length,
      latencyMs
    };
  }

  private validateRequest(request: TranslateRequest): void {
    if (!request.text?.trim()) {
      throw new AppError('Text is required.', 'INVALID_INPUT', 400);
    }
    if (request.text.length > this.options.maxTranslationChars) {
      throw new AppError('Text exceeds the configured maximum length.', 'TEXT_TOO_LONG', 400);
    }
    if (request.sourceLanguage === request.targetLanguage) {
      throw new AppError('Source and target languages must be different.', 'INVALID_LANGUAGE_PAIR', 400);
    }
  }
}
