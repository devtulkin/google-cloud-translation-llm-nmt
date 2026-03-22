import type { TranslateRequest, TranslateResponse } from '../types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function translateText(payload: TranslateRequest): Promise<TranslateResponse> {
  const response = await fetch(`${apiBaseUrl}/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new Error(errorBody?.error?.message ?? 'Translation failed.');
  }

  return (await response.json()) as TranslateResponse;
}
