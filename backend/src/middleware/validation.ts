import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

/**
 * Chat request validation schema.
 * - Messages limited to 50 entries, 2000 chars each (prevent prompt injection via length)
 * - Language must be 'en' or 'ar'
 */
export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
      })
    )
    .min(1, 'At least one message is required')
    .max(50, 'Conversation too long'),
  lang: z.enum(['en', 'ar']).default('en'),
  conversationId: z.string().optional(),
});

/**
 * Generic validation middleware factory.
 * Validates req.body against a Zod schema.
 */
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMessage = result.error.issues
        .map((e: any) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');
      return next(new AppError(errorMessage, 400, 'VALIDATION_ERROR'));
    }
    req.body = result.data;
    next();
  };
}
