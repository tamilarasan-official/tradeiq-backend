import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/tradeiq'),
  JWT_SECRET: z.string().default('dev-only-change-me'),
  ADMIN_API_KEY: z.string().optional(),
  WEB_ORIGIN: z.string().default('http://localhost:3000'),
  MOBILE_ORIGIN: z.string().default('*'),
});

export const env = envSchema.parse(process.env);
