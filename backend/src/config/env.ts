import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

// Validate required env vars on startup
export function validateEnv(): void {
  if (!config.geminiApiKey || config.geminiApiKey === 'your-gemini-api-key-here') {
    console.warn('⚠️  WARNING: GEMINI_API_KEY is not set. AI features will not work.');
  }
}
