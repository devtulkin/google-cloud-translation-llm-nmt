export const SUPPORTED_LANGUAGES = ['en', 'ru', 'uz'] as const;
export const SUPPORTED_MODELS = ['llm', 'nmt'] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];
export type TranslationModel = (typeof SUPPORTED_MODELS)[number];

export type TranslateRequest = {
  text: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  model: TranslationModel;
};

export type TranslateResponse = {
  translatedText: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  model: TranslationModel;
  detectedSourceLanguage?: string;
  chunks?: number;
  latencyMs?: number;
};
