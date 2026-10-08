import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import path from 'path';
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
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3847', 'http://localhost:3000', 'http://localhost:5000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Serve Static Files (Images & Uploads)
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
app.use(express.static(path.join(process.cwd(), 'public')));

// Production-Grade Healthcheck
app.get('/api/health', async (_req, res) => {
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    res.json({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: 'connected',
        latencyMs: dbLatency,
      },
      memory: {
        rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: err.message,
      },
    });
  }
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

// Graceful process termination for cloud orchestrators (Docker, K8s, Render, Railway)
const handleShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Draining connections and shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP and WebSocket server closed.');
    try {
      await prisma.$disconnect();
      console.log('Database client disconnected cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnect:', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Forcefully terminating process after 10s timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
