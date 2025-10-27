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
  MONGODB_URI: z.string(),
  MONGODB_USER: z.string(),
  MONGODB_PASSWORD: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  PAYMENT_API_KEY: z.string(),
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
  GOOGLE_API_KEY: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET_NAME: z.string(),
  PREFIX_STATIC_ENDPOINT: z.string(),
  REDIS_URI: z.string(),
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
