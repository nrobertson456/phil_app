/**
 * Current user profile: get and update display name.
 */
import express from 'express';
import { getDb } from '../db/initDb.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/me', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT email, display_name FROM users WHERE id = ?').get(req.userId);
  db.close();
  if (!row) return res.status(404).json({ error: 'User not found' });
  res.json({ email: row.email, display_name: row.display_name || '' });
});

router.patch('/me', (req, res) => {
  const display_name = typeof req.body?.display_name === 'string' ? req.body.display_name.trim().slice(0, 100) : '';
  const db = getDb();
  db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(display_name, req.userId);
  db.close();
  res.json({ display_name });
});

export default router;
