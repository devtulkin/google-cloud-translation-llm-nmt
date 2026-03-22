import { createApp } from './app.js';
import { config } from './lib/config.js';
import { TranslationService } from './services/translation-service.js';
import { LlmTranslator } from './translators/llm-translator.js';
import { NmtTranslator } from './translators/nmt-translator.js';

const translationService = new TranslationService(
  {
    llm: new LlmTranslator(config.projectId, config.location),
    nmt: new NmtTranslator(config.projectId, config.location)
  },
  {
    maxTranslationChars: config.maxTranslationChars,
    chunkSizeChars: config.chunkSizeChars
  }
);

const app = createApp(translationService);

app.listen(config.port, () => {
  console.info(`server_listening:${config.port}`);
});
