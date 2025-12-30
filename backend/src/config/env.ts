import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  BASE_URL: z.string().optional().refine(
    (val) => !val || val.startsWith('http://') || val.startsWith('https://'),
    { message: 'BASE_URL must be a valid URL starting with http:// or https://' }
  ),
  FRONTEND_URL: z.string().optional().refine(
    (val) => !val || val.startsWith('http://') || val.startsWith('https://'),
    { message: 'FRONTEND_URL must be a valid URL starting with http:// or https://' }
  ),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;

