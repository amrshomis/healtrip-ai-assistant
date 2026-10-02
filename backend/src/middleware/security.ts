import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/env';

/**
 * Security headers via helmet.
 */
export const securityHeaders = helmet();

/**
 * CORS configuration — restrict to frontend origin only.
 */
export const corsMiddleware = cors({
  origin: config.nodeEnv === 'production'
    ? config.frontendUrl
    : true, // Allow all origins in development for local testing
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
