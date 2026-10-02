import { Router, Request, Response, NextFunction } from 'express';
import { agent } from '../agent/agent';
import { chatRequestSchema, validateBody } from '../middleware/validation';
import { chatLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * POST /api/chat
 * Main chat endpoint — sends user messages to the AI agent.
 * Validates input, rate-limits, and returns grounded AI response.
 */
router.post(
  '/',
  chatLimiter,
  validateBody(chatRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messages, lang, conversationId } = req.body;

      console.log(`💬 Chat request: ${messages.length} messages, lang=${lang}`);

      const response = await agent.chat(messages, lang, conversationId);

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
