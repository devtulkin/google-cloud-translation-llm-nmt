import { describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
import { AppError } from '../src/lib/errors.js';
import type { TranslationService } from '../src/services/translation-service.js';

type MockResponse = {
  statusCode: number;
  body: unknown;
  status(code: number): MockResponse;
  json(payload: unknown): MockResponse;
};

function createResponse(): MockResponse {
  return {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    }
  };
}

function getRouteHandler(app: ReturnType<typeof createApp>, path: string, method: 'get' | 'post') {
  const stack = (app as unknown as { _router: { stack: Array<{ route?: { path?: string; methods?: Record<string, boolean>; stack: Array<{ handle: unknown }> }; handle: { length?: number } }> } })._router.stack;
  const routeLayer = stack.find((layer) => {
    return layer.route?.path === path && layer.route.methods?.[method];
  });

  if (!routeLayer) {
    throw new Error(`Route ${method.toUpperCase()} ${path} not found`);
  }

  return routeLayer.route.stack[0].handle as (
    request: { body?: unknown },
    response: MockResponse,
    next: (error?: unknown) => void
  ) => Promise<void> | void;
}

function getErrorHandler(app: ReturnType<typeof createApp>) {
  const stack = (app as unknown as { _router: { stack: Array<{ handle: { length?: number } }> } })._router.stack;
  const errorLayer = stack.find((layer) => layer.handle.length === 4);

  if (!errorLayer) {
    throw new Error('Error handler not found');
  }

  return errorLayer.handle as (
    error: unknown,
    request: unknown,
    response: MockResponse,
    next: (error?: unknown) => void
  ) => void;
}

describe('createApp', () => {
  it('returns health status', () => {
    const app = createApp({
      translate: vi.fn()
    } as unknown as TranslationService);
    const response = createResponse();
    const handler = getRouteHandler(app, '/api/health', 'get');

    handler({}, response, () => undefined);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('returns translated text from the translation service', async () => {
    const app = createApp({
      translate: vi.fn().mockResolvedValue({
        translatedText: 'Salom',
        model: 'nmt',
        sourceLanguage: 'en',
        targetLanguage: 'uz'
      })
    } as unknown as TranslationService);
    const response = createResponse();
    const handler = getRouteHandler(app, '/api/translate', 'post');
    let forwardedError: unknown;

    await handler(
      {
        body: {
          text: 'Hello',
          sourceLanguage: 'en',
          targetLanguage: 'uz',
          model: 'nmt'
        }
      },
      response,
      (error) => {
        forwardedError = error;
      }
    );

    expect(forwardedError).toBeUndefined();
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({ translatedText: 'Salom' });
  });

  it('renders normalized errors', () => {
    const app = createApp({
      translate: vi.fn()
    } as unknown as TranslationService);
    const response = createResponse();
    const errorHandler = getErrorHandler(app);

    errorHandler(
      new AppError('Text is required', 'INVALID_INPUT', 400),
      {},
      response,
      () => undefined
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'INVALID_INPUT',
        message: 'Text is required'
      }
    });
  });
});
