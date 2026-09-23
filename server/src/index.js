import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import analyticsRoutes from './routes/analytics.js';
import activityRoutes from './routes/activity.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    // ponytail: simple stdout access log. Add winston/pino if file aggregation or ELK drain requested.
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
    }
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'devpulse-api', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/activity', activityRoutes);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test' && !process.env.STANDALONE_IMPORT) {
  app.listen(PORT, () => {
    console.log(`DevPulse API server running on port ${PORT}`);
  });
}
