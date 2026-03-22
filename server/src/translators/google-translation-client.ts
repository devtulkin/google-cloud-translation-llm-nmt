import { v3 } from '@google-cloud/translate';

const { TranslationServiceClient } = v3;

export function createGoogleTranslationClient(): InstanceType<typeof TranslationServiceClient> {
  return new TranslationServiceClient();
}
