import type { LanguageCode } from '../types.js';

export type TranslatorInput = {
  text: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
};

export type TranslatorOutput = {
  translatedText: string;
  detectedSourceLanguage?: string;
};

export interface Translator {
  translate(input: TranslatorInput): Promise<TranslatorOutput>;
}
