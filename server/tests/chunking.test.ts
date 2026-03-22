import { describe, expect, it } from 'vitest';

import { chunkText } from '../src/lib/chunking.js';

describe('chunkText', () => {
  it('returns short text as a single chunk', () => {
    expect(chunkText('Hello world', 50)).toEqual(['Hello world']);
  });

  it('splits large text on paragraph boundaries first', () => {
    const text = ['First paragraph sentence.', 'Second paragraph sentence.'].join('\n\n');

    expect(chunkText(text, 30)).toEqual(['First paragraph sentence.', 'Second paragraph sentence.']);
  });

  it('falls back to sentence splitting inside a paragraph', () => {
    const text = 'One short sentence. Two short sentence. Three short sentence.';

    expect(chunkText(text, 25)).toEqual(['One short sentence.', 'Two short sentence.', 'Three short sentence.']);
  });

  it('falls back to hard slicing when no separator works', () => {
    const text = 'abcdefghijklmnopqrstuvwxyz';

    expect(chunkText(text, 10)).toEqual(['abcdefghij', 'klmnopqrst', 'uvwxyz']);
  });
});
