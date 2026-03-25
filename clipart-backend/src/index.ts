import express from 'express';
import cors from 'cors';
import { config } from './config';
import generateRouter from './routes/generate';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv });
});

// Routes
app.use('/generate', generateRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(config.port, () => {
  console.log(`✅ Backend running on http://localhost:${config.port}`);
});