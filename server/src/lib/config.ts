import dotenv from 'dotenv';

dotenv.config();

function getNumberEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  port: getNumberEnv('PORT', 8787),
  projectId: process.env.GOOGLE_CLOUD_PROJECT ?? '',
  location: process.env.GOOGLE_CLOUD_LOCATION ?? 'global',
  maxTranslationChars: getNumberEnv('MAX_TRANSLATION_CHARS', 12000),
  chunkSizeChars: getNumberEnv('CHUNK_SIZE_CHARS', 3000)
};
