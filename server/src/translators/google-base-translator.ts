import { AppError, toAppError } from '../lib/errors.js';
import type { LanguageCode } from '../types.js';
import { createGoogleTranslationClient } from './google-translation-client.js';
import type { Translator, TranslatorInput, TranslatorOutput } from './types.js';

type ModelName = 'general/nmt' | 'general/translation-llm';

type TranslationClient = ReturnType<typeof createGoogleTranslationClient>;

type TranslationRecord = {
  translatedText?: string | null;
  detectedLanguageCode?: string | null;
};

export class GoogleBaseTranslator implements Translator {
  private readonly client: TranslationClient;
  private readonly projectId: string;
  private readonly location: string;
  private readonly modelName: ModelName;

  constructor(
    projectId: string,
    location: string,
    modelName: ModelName,
    client?: TranslationClient
  ) {
    this.client = client ?? createGoogleTranslationClient();
    this.projectId = projectId;
    this.location = location;
    this.modelName = modelName;
  }

  async translate(input: TranslatorInput): Promise<TranslatorOutput> {
    if (!this.projectId) {
      throw new AppError('GOOGLE_CLOUD_PROJECT is required.', 'INVALID_CONFIGURATION', 500);
    }

    try {
      const [response] = await this.client.translateText({
        parent: `projects/${this.projectId}/locations/${this.location}`,
        contents: [input.text],
        mimeType: 'text/plain',
        sourceLanguageCode: input.sourceLanguage,
        targetLanguageCode: input.targetLanguage,
        model: `projects/${this.projectId}/locations/${this.location}/models/${this.modelName}`
      });

      const translation = (response.translations?.[0] ?? {}) as TranslationRecord;
      return {
        translatedText: translation.translatedText ?? '',
        detectedSourceLanguage: translation.detectedLanguageCode ?? undefined
      };
    } catch (error) {
      throw toAppError(error);
    }
  }
}

export function isLanguageCode(value: string): value is LanguageCode {
  return ['en', 'ru', 'uz'].includes(value);
}
