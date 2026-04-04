/**
 * Broadway Musical App - Backend Server
 *
 * Step 1: Run "npm install" in the backend folder
 * Step 2: Copy .env.example to .env and set JWT_SECRET (and OPENAI_API_KEY if you want AI)
 * Step 3: Run "npm run dev" or "npm start"
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { initDb } from './db/initDb.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import musicalsRoutes from './routes/musicals.js';
import charactersRoutes from './routes/characters.js';
import songsRoutes from './routes/songs.js';
import scriptRoutes from './routes/script.js';
import aiRoutes from './routes/ai.js';
import inspirationRoutes from './routes/inspiration.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

initDb();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/musicals', musicalsRoutes);
app.use('/api/characters', charactersRoutes);
app.use('/api/songs', songsRoutes);
app.use('/api/script', scriptRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/inspiration', inspirationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Broadway App API' });
});

// Serve built frontend (SPA) in production
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🎭 Broadway App API running at http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health\n`);
});
