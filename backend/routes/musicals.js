/**
 * Musical (story) routes: create, get, update title, premise, plot.
 * Each user can have one or more musicals; we'll use the first one or create one.
 */
import express from 'express';
import { getDb } from '../db/initDb.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Get current user's musical(s). Returns list; frontend can pick "current" or first.
router.get('/', (req, res) => {
  const db = getDb();
  const list = db.prepare('SELECT id, title, premise, plot, created_at, updated_at FROM musicals WHERE user_id = ? ORDER BY updated_at DESC').all(req.userId);
  db.close();
  res.json(list);
});

// Get one musical by id (must belong to user)
router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT id, title, premise, plot, created_at, updated_at FROM musicals WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  db.close();
  if (!row) return res.status(404).json({ error: 'Musical not found' });
  res.json(row);
});

// Create a new musical
router.post('/', (req, res) => {
  const { title = '', premise = '', plot = '' } = req.body || {};
  const db = getDb();
  const result = db.prepare('INSERT INTO musicals (user_id, title, premise, plot) VALUES (?, ?, ?, ?)').run(req.userId, title, premise, plot);
  db.close();
  const id = Number(result.lastInsertRowid);
  res.status(201).json({ id, title, premise, plot });
});

// Update musical (story builder)
router.put('/:id', (req, res) => {
  const { title, premise, plot } = req.body || {};
  const db = getDb();
  const existing = db.prepare('SELECT id FROM musicals WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) {
    db.close();
    return res.status(404).json({ error: 'Musical not found' });
  }
  const updates = [];
  const values = [];
  if (title !== undefined) { updates.push('title = ?'); values.push(title); }
  if (premise !== undefined) { updates.push('premise = ?'); values.push(premise); }
  if (plot !== undefined) { updates.push('plot = ?'); values.push(plot); }
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);
  db.prepare(`UPDATE musicals SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  db.close();
  res.json({ ok: true });
});

// Delete musical (must belong to user). Delete related rows first to satisfy foreign keys.
router.delete('/:id', (req, res) => {
  const db = getDb();
  const id = req.params.id;
  const existing = db.prepare('SELECT id FROM musicals WHERE id = ? AND user_id = ?').get(id, req.userId);
  if (!existing) {
    db.close();
    return res.status(404).json({ error: 'Musical not found' });
  }
  db.prepare('DELETE FROM script_sections WHERE musical_id = ?').run(id);
  db.prepare('DELETE FROM songs WHERE musical_id = ?').run(id);
  db.prepare('DELETE FROM characters WHERE musical_id = ?').run(id);
  db.prepare('DELETE FROM musicals WHERE id = ?').run(id);
  db.close();
  res.json({ ok: true });
});

export default router;
