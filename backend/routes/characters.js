/**
 * Character routes: CRUD for characters belonging to a musical.
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

// List characters for a musical
router.get('/musical/:musicalId', (req, res) => {
  const db = getDb();
  if (!ensureMusicalOwnership(db, req.params.musicalId, req.userId)) {
    db.close();
    return res.status(404).json({ error: 'Musical not found' });
  }
  const list = db.prepare('SELECT id, name, description, role, created_at FROM characters WHERE musical_id = ? ORDER BY id').all(req.params.musicalId);
  db.close();
  res.json(list);
});

// Create character
router.post('/', (req, res) => {
  const { musical_id, name, description = '', role = '' } = req.body || {};
  if (!musical_id || !name) return res.status(400).json({ error: 'musical_id and name required' });
  const db = getDb();
  if (!ensureMusicalOwnership(db, musical_id, req.userId)) {
    db.close();
    return res.status(404).json({ error: 'Musical not found' });
  }
  const result = db.prepare('INSERT INTO characters (musical_id, name, description, role) VALUES (?, ?, ?, ?)').run(musical_id, name, description, role);
  db.close();
  res.status(201).json({ id: result.lastInsertRowid, musical_id, name, description, role });
});

// Update character
router.put('/:id', (req, res) => {
  const { name, description, role } = req.body || {};
  const db = getDb();
  const ch = db.prepare('SELECT c.id, c.musical_id FROM characters c JOIN musicals m ON m.id = c.musical_id WHERE c.id = ? AND m.user_id = ?').get(req.params.id, req.userId);
  if (!ch) {
    db.close();
    return res.status(404).json({ error: 'Character not found' });
  }
  const updates = []; const values = [];
  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }
  if (role !== undefined) { updates.push('role = ?'); values.push(role); }
  if (updates.length) {
    values.push(req.params.id);
    db.prepare(`UPDATE characters SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
  db.close();
  res.json({ ok: true });
});

// Delete character
router.delete('/:id', (req, res) => {
  const db = getDb();
  const ch = db.prepare('SELECT c.id FROM characters c JOIN musicals m ON m.id = c.musical_id WHERE c.id = ? AND m.user_id = ?').get(req.params.id, req.userId);
  if (!ch) {
    db.close();
    return res.status(404).json({ error: 'Character not found' });
  }
  db.prepare('DELETE FROM characters WHERE id = ?').run(req.params.id);
  db.close();
  res.json({ ok: true });
});

export default router;
