import { config } from 'dotenv';

// Load environment variables
config();

export const env = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Solana RPC
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  redisPassword: process.env.REDIS_PASSWORD || '',
  redisCacheTtl: parseInt(process.env.REDIS_CACHE_TTL || '120', 10),

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // API Rate Limiting
  apiRateLimit: parseInt(process.env.API_RATE_LIMIT || '100', 10),
  apiRateLimitWindow: parseInt(process.env.API_RATE_LIMIT_WINDOW || '60000', 10),
} as const;

export const isDevelopment = env.nodeEnv === 'development';
export const isProduction = env.nodeEnv === 'production';
