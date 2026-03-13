/**
 * Broadway Musical App - Backend Server
 *
 * Step 1: Run "npm install" in the backend folder
 * Step 2: Copy .env.example to .env and set JWT_SECRET (and OPENAI_API_KEY if you want AI)
 * Step 3: Run "npm run dev" or "npm start"
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db/initDb.js';
import authRoutes from './routes/auth.js';
import musicalsRoutes from './routes/musicals.js';
import charactersRoutes from './routes/characters.js';
import songsRoutes from './routes/songs.js';
import scriptRoutes from './routes/script.js';
import aiRoutes from './routes/ai.js';

initDb();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/musicals', musicalsRoutes);
app.use('/api/characters', charactersRoutes);
app.use('/api/songs', songsRoutes);
app.use('/api/script', scriptRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Broadway App API' });
});

app.listen(PORT, () => {
  console.log(`\n  🎭 Broadway App API running at http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health\n`);
});
