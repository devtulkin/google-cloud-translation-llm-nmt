export const languages = [
  { label: 'English', value: 'en' },
  { label: 'Russian', value: 'ru' },
  { label: 'Uzbek', value: 'uz' }
] as const;

export type LanguageCode = (typeof languages)[number]['value'];
export type TranslationModel = 'llm' | 'nmt';

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
