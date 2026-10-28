import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, AppError } from './middleware/error.middleware.js';
import { sendSuccess } from './utils/response.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(
    res,
    {
      status: 'ok',
      service: 'OVE Solutions CRM API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      env: env.nodeEnv,
    },
    'API is running healthy'
  );
});

// Feature Routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
});

// Centralized error handler
app.use(errorHandler);

export default app;
