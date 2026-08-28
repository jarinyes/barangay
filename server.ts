import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './src/server/auth.js';
import { getDb } from './src/server/db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000', // Vite dev server
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Initialize database
getDb().catch(console.error);

// Routes
app.use('/api/auth', authRouter);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
