import { useState } from 'react';

import { translateText } from './lib/api';
import { languages, type LanguageCode, type TranslationModel } from './types';
import './styles.css';

type TranslationState = {
  sourceText: string;
  translatedText: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  model: TranslationModel;
  isLoading: boolean;
  error: string;
};

const initialState: TranslationState = {
  sourceText: '',
  translatedText: '',
  sourceLanguage: 'en',
  targetLanguage: 'uz',
  model: 'nmt',
  isLoading: false,
  error: ''
};

export function App() {
  const [state, setState] = useState<TranslationState>(initialState);

  async function handleTranslate() {
    setState((current) => ({ ...current, isLoading: true, error: '' }));

    try {
      const result = await translateText({
        text: state.sourceText,
        sourceLanguage: state.sourceLanguage,
        targetLanguage: state.targetLanguage,
        model: state.model
      });

      setState((current) => ({
        ...current,
        translatedText: result.translatedText,
        isLoading: false,
        error: ''
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        translatedText: '',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Translation failed.'
      }));
    }
  }

  async function handleCopy() {
    if (!state.translatedText) {
      return;
    }

    await navigator.clipboard.writeText(state.translatedText);
  }

  function updateSourceText(value: string) {
    setState((current) => ({
      ...current,
      sourceText: value,
      translatedText: '',
      error: ''
    }));
  }

  function swapLanguages() {
    setState((current) => ({
      ...current,
      sourceLanguage: current.targetLanguage,
      targetLanguage: current.sourceLanguage,
      translatedText: '',
      error: ''
    }));
  }

  function clearTexts() {
    setState((current) => ({
      ...current,
      sourceText: '',
      translatedText: '',
      error: ''
    }));
  }

  return (
    <main className="page">
      <section className="translator-shell">
        <header className="hero">
          <p className="eyebrow">Google Cloud Translation</p>
          <h1>Uzbek Translator</h1>
          <p className="subtitle">Translate between English, Russian, and Uzbek with LLM or NMT.</p>
        </header>

        <div className="toolbar">
          <label>
            <span>From</span>
            <select
              aria-label="From"
              value={state.sourceLanguage}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  sourceLanguage: event.target.value as LanguageCode,
                  translatedText: '',
                  error: ''
                }))
              }
            >
              {languages.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>

          <button
            className="swap-button icon-button"
            type="button"
            onClick={swapLanguages}
            aria-label="Swap languages"
            title="Swap languages"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7 7h11l-3.5-3.5M17 17H6l3.5 3.5M18 7l-3.5-3.5M6 17l3.5 3.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>

          <label>
            <span>To</span>
            <select
              aria-label="To"
              value={state.targetLanguage}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  targetLanguage: event.target.value as LanguageCode,
                  translatedText: '',
                  error: ''
                }))
              }
            >
              {languages.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="model-toggle" role="group" aria-label="Model selector">
          <button
            type="button"
            className={state.model === 'llm' ? 'model-button active' : 'model-button'}
            onClick={() => setState((current) => ({ ...current, model: 'llm', error: '' }))}
          >
            LLM
          </button>
          <button
            type="button"
            className={state.model === 'nmt' ? 'model-button active' : 'model-button'}
            onClick={() => setState((current) => ({ ...current, model: 'nmt', error: '' }))}
          >
            NMT
          </button>
        </div>

        <div className="panels">
          <label className="panel">
            <span>Source text</span>
            <textarea
              aria-label="Source text"
              value={state.sourceText}
              onChange={(event) => updateSourceText(event.target.value)}
              placeholder="Enter text to translate"
            />
          </label>

          <label className="panel">
            <span>Translated text</span>
            <textarea
              aria-label="Translated text"
              readOnly
              value={state.translatedText}
              placeholder="Translation appears here"
            />
          </label>
        </div>

        {state.error ? <p className="error">{state.error}</p> : null}

        <div className="actions">
          <button
            className="primary-button"
            type="button"
            disabled={state.isLoading}
            onClick={() => void handleTranslate()}
          >
            {state.isLoading ? 'Translating...' : 'Translate'}
          </button>
          <button type="button" className="secondary-button" onClick={() => void handleCopy()}>
            Copy result
          </button>
          <button type="button" className="secondary-button" onClick={clearTexts}>
            Clear
          </button>
        </div>
      </section>
    </main>
  );
}
