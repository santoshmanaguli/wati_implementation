import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import customerRoutes from './routes/customer.routes';
import invoiceRoutes from './routes/invoice.routes';
import publicRoutes from './routes/public.routes';
import watiRoutes from './routes/wati.routes';
import testRoutes from './routes/test.routes';

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/public', publicRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/wati', watiRoutes);
app.use('/api/test', testRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

