import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import prisma from '../lib/db';
import authRouter from './routes/auth';
import auditsRouter from './routes/audits';
import defectsRouter from './routes/defects';
import entitiesRouter from './routes/entities';
import ownerRouter from './routes/owner';
import { initSocketServer } from './socket';

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initSocketServer(server);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/audits', auditsRouter);
app.use('/api/defects', defectsRouter);
app.use('/api/owner', ownerRouter);
app.use('/api', entitiesRouter);

server.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Facielis Backend API & Socket Server running on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`📡 WebSocket Base: ws://localhost:${PORT}`);
  
  // Warm up DB queries in background
  try {
    await Promise.all([
      prisma.user.count(),
      prisma.defect.count(),
      prisma.audit.count(),
      prisma.venue.count(),
    ]);
    console.log(`🔥 Database connection & query cache pre-warmed!`);
  } catch (err) {
    // Ignore warmup error if DB is seeding
  }
  console.log(`==================================================\n`);
});
