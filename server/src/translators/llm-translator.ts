import { GoogleBaseTranslator } from './google-base-translator.js';

export class LlmTranslator extends GoogleBaseTranslator {
  constructor(
    projectId: string,
    location: string,
    client?: ConstructorParameters<typeof GoogleBaseTranslator>[3]
  ) {
    super(projectId, location, 'general/translation-llm', client);
  }
}
