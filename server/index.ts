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
import meetingRoutes from './routes/meetingRoutes';
import revisionRoutes from './routes/revisionRoutes';
import authRoutes from './auth/authRoutes';
import connectMongoDB from './mongodb';
import { setupSocketIO } from './sockets';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { config } from './utils/config';
import { authenticate } from './middleware/authenticate';
import { clientPortalGuard } from './middleware/clientPortalGuard';
import { startSummaryScheduler } from './services/summaryScheduler';
import { setupWorkers } from './queue';

// Domain modules (modular monolith)
import {
  crmRoutes,
  projectRoutes,
  documentRoutes,
  billingRoutes,
  notificationRoutes,
  adminRoutes,
  deadlineRoutes,
} from './modules';

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
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*"],
      connectSrc: ["'self'"],
    },
  },
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true,
  frameguard: { action: 'deny' },
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

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    architecture: 'modular-monolith',
    modules: ['auth', 'crm', 'projects', 'documents', 'billing', 'notifications', 'admin', 'conversations'],
    timestamp: new Date().toISOString(),
  });
});

// Auth routes (unauthenticated + authenticated)
app.use('/api/auth', authRoutes);

// Public routes
app.use('/api', publicRouter);

// Domain module routes (authenticated + role-guarded within each module)
app.use('/api', authenticate, clientPortalGuard, crmRoutes);
app.use('/api', authenticate, clientPortalGuard, projectRoutes);
app.use('/api', authenticate, clientPortalGuard, documentRoutes);
app.use('/api', authenticate, clientPortalGuard, billingRoutes);
app.use('/api', authenticate, notificationRoutes);
app.use('/api', authenticate, adminRoutes);
app.use('/api', authenticate, clientPortalGuard, deadlineRoutes);

// Legacy API routes (backward compatible, mounted after modules to allow override)
app.use('/api', authenticate, clientPortalGuard, apiRouter);

// Conversation routes
app.use('/api/conversations', conversationRoutes);

// Meeting routes
app.use('/api/meetings', meetingRoutes);

// Revision routes
app.use('/api/revisions', revisionRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Serve static frontend in production
if (!isDev) {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(errorHandler);

(async () => {
  await connectMongoDB();
  startSummaryScheduler();
})();
setupWorkers();
setupSocketIO(server);

server.listen(config.port, () => {
  console.log(`DevDale API server running on http://localhost:${config.port}`);
  console.log(`Modules: auth, crm, projects, documents, billing, notifications, admin, conversations`);
  if (isDev) {
    console.log(`Make sure Vite dev server is running on port 3000`);
  }
});


