import './utils/config';
import http from 'http';
import path from 'path';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import apiRouter from './routes/api';
import publicRouter from './routes/publicRoutes';
import conversationRoutes from './routes/conversationRoutes';
import authRoutes from './auth/authRoutes';
import connectMongoDB from './mongodb';
import { setupSocketIO } from './sockets';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { config } from './utils/config';
import { authenticate } from './middleware/authenticate';
import { clientPortalGuard } from './middleware/clientPortalGuard';
import { startSummaryScheduler } from './services/summaryScheduler';

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
});

const app = express();
const server = http.createServer(app);

const isDev = config.nodeEnv !== 'production';

app.use(helmet({
  crossOriginResourcePolicy: isDev ? { policy: 'cross-origin' } : false,
  contentSecurityPolicy: isDev ? false : undefined,
}));

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api', publicRouter);
app.use('/api', authenticate, clientPortalGuard, apiRouter);
app.use('/api/conversations', conversationRoutes);

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

if (!isDev) {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(errorHandler);

connectMongoDB();
startSummaryScheduler();
setupSocketIO(server);

server.listen(config.port, () => {
  console.log(`DevDale API server running on http://localhost:${config.port}`);
  if (isDev) {
    console.log(`Make sure Vite dev server is running on port 3000`);
  }
});
