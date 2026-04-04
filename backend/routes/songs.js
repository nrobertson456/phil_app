/**
 * Song planner routes: CRUD for songs in a musical.
 */
import express from 'express';
import { getDb } from '../db/initDb.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

function ensureMusicalOwnership(db, musicalId, userId) {
  const m = db.prepare('SELECT id FROM musicals WHERE id = ? AND user_id = ?').get(musicalId, userId);
  return !!m;
}

router.get('/musical/:musicalId', (req, res) => {
  const db = getDb();
  if (!ensureMusicalOwnership(db, req.params.musicalId, req.userId)) {
    db.close();
    return res.status(404).json({ error: 'Musical not found' });
  }
  const list = db.prepare('SELECT id, title, act_number, scene_number, notes, created_at FROM songs WHERE musical_id = ? ORDER BY act_number, scene_number, id').all(req.params.musicalId);
  db.close();
  res.json(list);
});

router.post('/', (req, res) => {
  const { musical_id, title, act_number = 1, scene_number = 1, notes = '' } = req.body || {};
  if (!musical_id || !title) return res.status(400).json({ error: 'musical_id and title required' });
  const db = getDb();
  if (!ensureMusicalOwnership(db, musical_id, req.userId)) {
    db.close();
    return res.status(404).json({ error: 'Musical not found' });
  }
  const result = db.prepare('INSERT INTO songs (musical_id, title, act_number, scene_number, notes) VALUES (?, ?, ?, ?, ?)').run(musical_id, title, act_number, scene_number, notes);
  db.close();
  const id = Number(result.lastInsertRowid);
  res.status(201).json({ id, musical_id, title, act_number, scene_number, notes });
});

router.put('/:id', (req, res) => {
  const { title, act_number, scene_number, notes } = req.body || {};
  const db = getDb();
  const row = db.prepare('SELECT s.id FROM songs s JOIN musicals m ON m.id = s.musical_id WHERE s.id = ? AND m.user_id = ?').get(req.params.id, req.userId);
  if (!row) {
    db.close();
    return res.status(404).json({ error: 'Song not found' });
  }
  const updates = []; const values = [];
  if (title !== undefined) { updates.push('title = ?'); values.push(title); }
  if (act_number !== undefined) { updates.push('act_number = ?'); values.push(act_number); }
  if (scene_number !== undefined) { updates.push('scene_number = ?'); values.push(scene_number); }
  if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
  if (updates.length) {
    values.push(req.params.id);
    db.prepare(`UPDATE songs SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
  db.close();
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT s.id FROM songs s JOIN musicals m ON m.id = s.musical_id WHERE s.id = ? AND m.user_id = ?').get(req.params.id, req.userId);
  if (!row) {
    db.close();
    return res.status(404).json({ error: 'Song not found' });
  }
  db.prepare('DELETE FROM songs WHERE id = ?').run(req.params.id);
  db.close();
  res.json({ ok: true });
});

export default router;
