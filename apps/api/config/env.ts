import dotenv from 'dotenv';
import { z } from 'zod';

// Load env vars from root .env
dotenv.config({ path: '../../.env' });

const envSchema = z.object({
  DBURL: z.string().url(),
  PORT: z.string().default('3001'),
  DB_NAME: z.string().default('smart-price-tracker'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
