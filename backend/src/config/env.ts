import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  BASE_URL: z.string().url().optional(),
  FRONTEND_URL: z.string().url().optional(),
  WATI_API_ENDPOINT: z.string().url(),
  WATI_API_TOKEN: z.string().min(1),
  WATI_WHATSAPP_NUMBER: z.string().min(1),
  WATI_CHANNEL_PHONE_NUMBER: z.string().optional(),
  WATI_INVOICE_TEMPLATE_NAME: z.string().optional(),
  WATI_TEST_PDF_URL: z.string().url().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;

