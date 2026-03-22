import { z } from 'zod';

import { SUPPORTED_LANGUAGES, SUPPORTED_MODELS } from '../types.js';

export const translateRequestSchema = z.object({
  text: z.string().min(1, 'Text is required.'),
  sourceLanguage: z.enum(SUPPORTED_LANGUAGES),
  targetLanguage: z.enum(SUPPORTED_LANGUAGES),
  model: z.enum(SUPPORTED_MODELS)
});
