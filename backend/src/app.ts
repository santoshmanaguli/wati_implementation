import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import customerRoutes from './routes/customer.routes';
import invoiceRoutes from './routes/invoice.routes';
import publicRoutes from './routes/public.routes';

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Readiness check (for Kubernetes/Docker)
app.get('/ready', async (req, res) => {
  try {
    // Check database connection
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    
    res.json({ 
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'not ready',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Metrics endpoint (for monitoring)
app.get('/metrics', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
    },
    uptime: Math.round(process.uptime()) + ' seconds',
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/public', publicRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

