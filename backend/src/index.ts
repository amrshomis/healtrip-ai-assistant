import express from 'express';
import { config, validateEnv } from './config/env';
import { securityHeaders, corsMiddleware } from './middleware/security';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import chatRouter from './routes/chat';
import doctorsRouter from './routes/doctors';
import hospitalsRouter from './routes/hospitals';

// Validate environment on startup
validateEnv();

const app = express();

// ── Security Middleware Stack ──
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(apiLimiter);
app.use(express.json({ limit: '10kb' })); // Limit payload size

// ── Health Check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ──
app.use('/api/chat', chatRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/hospitals', hospitalsRouter);

// ── Global Error Handler (must be last) ──
app.use(errorHandler);

// ── Start Server ──
app.listen(config.port, () => {
  console.log('');
  console.log('🏥 ═══════════════════════════════════════════');
  console.log(`🏥  HealTrip AI Assistant Backend`);
  console.log(`🏥  Running on: http://localhost:${config.port}`);
  console.log(`🏥  Environment: ${config.nodeEnv}`);
  console.log(`🏥  Gemini API Key: ${config.geminiApiKey ? '✅ Configured' : '❌ Missing'}`);
  console.log('🏥 ═══════════════════════════════════════════');
  console.log('');
});

export default app;
