import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from './config/index.js';
import scanRouter from './routes/scan.js';

// Create main app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);

// Health check
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'Solvance API is running',
    version: '1.0.0',
    timestamp: Date.now(),
  });
});

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: Date.now(),
  });
});

// API routes
app.route('/api/scan', scanRouter);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
      },
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('❌ Unhandled error:', err);
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    },
    500
  );
});

// Start server
console.log(`🚀 Starting Solvance Backend API...`);
console.log(`📡 Environment: ${env.nodeEnv}`);
console.log(`🔗 Solana RPC: ${env.solanaRpcUrl}`);
console.log(`💾 Redis: ${env.redisUrl}`);

Bun.serve({
  fetch: app.fetch,
  port: env.port,
});

console.log(`✅ Server running on http://localhost:${env.port}`);
