import z from 'zod';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

config({
  path: '.env',
});

if (!fs.existsSync(path.resolve('.env'))) {
  console.log('.env file is missing!');
  process.exit(1);
}

const configSchema = z.object({
  APP_NAME: z.string().default('Health Mate'),
  PORT: z.string(),
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  SECRET_API_KEY: z.string(),
  ADMIN_FULLNAME: z.string(),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string().min(6),
  ADMIN_PHONENUMBER: z.string().min(10).max(15),
  OTP_EXPIRES_IN: z.string(),
  RESEND_API_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.url(),
  GOOGLE_CLIENT_REDIRECT_URI: z.url(),
});

const configServer = configSchema.safeParse(process.env);

if (!configServer.success) {
  console.error(
    '❌ Invalid environment variables',
    configServer.error.format(),
  );
  process.exit(1);
}

// console.log(configServer);
const envConfig = configServer.data;

export default envConfig;
