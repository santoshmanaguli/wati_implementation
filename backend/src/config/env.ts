import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Helper to validate URL format only if value is provided
const optionalUrlSchema = z
  .string()
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  })
  .refine(
    (val) => {
      // Allow undefined/empty - no validation needed
      if (!val) return true;
      // If value exists, it must start with http:// or https://
      return val.startsWith('http://') || val.startsWith('https://');
    },
    { message: 'Must be a valid URL starting with http:// or https://' }
  );

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  BASE_URL: optionalUrlSchema,
  FRONTEND_URL: optionalUrlSchema,
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;
