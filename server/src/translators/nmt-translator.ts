import { GoogleBaseTranslator } from './google-base-translator.js';

export class NmtTranslator extends GoogleBaseTranslator {
  constructor(projectId: string, location: string) {
    super(projectId, location, 'general/nmt');
  }
}
