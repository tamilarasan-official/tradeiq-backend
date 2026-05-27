import cors from 'cors';
import express, { ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { ZodError } from 'zod';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import marketRoutes from './routes/markets.js';
import orderRoutes from './routes/orders.js';
import portfolioRoutes from './routes/portfolio.js';
import researchRoutes from './routes/research.js';
import stockRoutes from './routes/stocks.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'tradeiq-backend' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/markets', marketRoutes);
  app.use('/api/stocks', stockRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/portfolio', portfolioRoutes);
  app.use('/api/research', researchRoutes);
  app.use('/api/admin', adminRoutes);

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Validation failed', issues: error.issues });
    }
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  };

  app.use(errorHandler);

  return app;
}
