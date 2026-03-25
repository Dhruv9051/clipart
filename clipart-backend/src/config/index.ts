import dotenv from 'dotenv';
dotenv.config();

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error('Missing REPLICATE_API_TOKEN in .env');
}

export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  replicateToken: process.env.REPLICATE_API_TOKEN,
  nodeEnv: process.env.NODE_ENV ?? 'development',
};