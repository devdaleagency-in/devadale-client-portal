import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devdale',
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    issuer: process.env.JWT_ISSUER || 'devdale',
    audience: process.env.JWT_AUDIENCE || 'devdale-portal',
  },

  email: {
    from: process.env.EMAIL_FROM || 'noreply@devdale.com',
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || ['http://localhost:3000', 'http://localhost:5173'],
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
  },

  appUrl: process.env.APP_URL || 'http://localhost:3000',
};
