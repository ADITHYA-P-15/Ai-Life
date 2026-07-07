import express from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth.js';
import { auditMiddleware } from './middleware/audit.js';

import authRoutes from './routes/auth.js';
import dailyLogRoutes from './routes/dailyLogs.js';
import habitRoutes from './routes/habits.js';
import expenseRoutes from './routes/expenses.js';
import hobbyRoutes from './routes/hobbies.js';
import settingsRoutes from './routes/settings.js';
import insightRoutes from './routes/insights.js';
import chatRoutes from './routes/chat.js';

export function createApp() {
  const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
  app.use(express.json());
  app.use(auditMiddleware);

  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`${req.method} ${req.path}`);
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api', authenticate);
  app.use('/api', dailyLogRoutes);
  app.use('/api/habits', habitRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/hobbies', hobbyRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/insights', insightRoutes);
  app.use('/api/chat', chatRoutes);

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
  });

  app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}

const app = createApp();
export default app;
