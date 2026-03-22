import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('switches models and submits the selected translator', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        translatedText: 'Salom',
        model: 'llm',
        sourceLanguage: 'en',
        targetLanguage: 'uz',
        chunks: 1,
        latencyMs: 12
      })
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'LLM' }));
    await user.type(screen.getByLabelText('Source text'), 'Hello');
    await user.click(screen.getByRole('button', { name: 'Translate' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/translate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: 'Hello',
            sourceLanguage: 'en',
            targetLanguage: 'uz',
            model: 'llm'
          })
        })
      );
    });

    expect(await screen.findByDisplayValue('Salom')).toBeInTheDocument();
  });

  it('swaps languages and clears stale output when input changes', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        translatedText: 'Privet',
        model: 'nmt',
        sourceLanguage: 'uz',
        targetLanguage: 'ru'
      })
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    await user.selectOptions(screen.getByLabelText('From'), 'uz');
    await user.selectOptions(screen.getByLabelText('To'), 'ru');
    await user.click(screen.getByRole('button', { name: 'NMT' }));
    await user.type(screen.getByLabelText('Source text'), 'Salom');
    await user.click(screen.getByRole('button', { name: 'Translate' }));

    expect(await screen.findByDisplayValue('Privet')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Swap languages' }));
    expect(screen.getByLabelText('From')).toHaveValue('ru');
    expect(screen.getByLabelText('To')).toHaveValue('uz');

    await user.type(screen.getByLabelText('Source text'), '!');
    expect(screen.getByLabelText('Translated text')).toHaveValue('');
  });

  it('clears both textareas when the clear action is pressed', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(screen.getByLabelText('Source text'), 'Hello');
    expect(screen.getByLabelText('Source text')).toHaveValue('Hello');

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByLabelText('Source text')).toHaveValue('');
    expect(screen.getByLabelText('Translated text')).toHaveValue('');
  });
});
