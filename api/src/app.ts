import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import authRoutes from './routes/auth';
import boardRoutes from './routes/boards';
import accountRoutes from './routes/account';
import adminRoutes from './routes/admin';
import { errorHandler, notFoundHandler } from './middleware/error';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.APP_BASE_URL,
    credentials: true
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
