import cors from 'cors';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError, toAppError } from './lib/errors.js';
import { translateRequestSchema } from './lib/validation.js';
import type { TranslationService } from './services/translation-service.js';

export function createApp(translationService: TranslationService) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.post('/api/translate', async (request, response, next) => {
    try {
      const body = translateRequestSchema.parse(request.body);
      const result = await translationService.translate(body);
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof ZodError) {
      response.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: error.issues[0]?.message ?? 'Invalid translation request.'
        }
      });
      return;
    }

    const appError = error instanceof AppError ? error : toAppError(error);
    response.status(appError.statusCode).json({
      error: {
        code: appError.code,
        message: appError.message
      }
    });
  });

  return app;
}
