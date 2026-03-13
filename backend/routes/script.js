/**
 * Script writing routes: get/update script sections for a musical.
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
  const list = db.prepare('SELECT id, section_title, content, sort_order, updated_at FROM script_sections WHERE musical_id = ? ORDER BY sort_order, id').all(req.params.musicalId);
  db.close();
  res.json(list);
});

// Create or get default script section (one main "Script" section per musical for simplicity)
router.post('/', (req, res) => {
  const { musical_id, section_title = 'Script', content = '' } = req.body || {};
  if (!musical_id) return res.status(400).json({ error: 'musical_id required' });
  const db = getDb();
  if (!ensureMusicalOwnership(db, musical_id, req.userId)) {
    db.close();
    return res.status(404).json({ error: 'Musical not found' });
  }
  const existing = db.prepare('SELECT id FROM script_sections WHERE musical_id = ?').get(musical_id);
  if (existing) {
    db.close();
    return res.json({ id: existing.id, section_title: 'Script', content: '' });
  }
  const result = db.prepare('INSERT INTO script_sections (musical_id, section_title, content, sort_order) VALUES (?, ?, ?, 0)').run(musical_id, section_title, content);
  db.close();
  res.status(201).json({ id: result.lastInsertRowid, section_title, content });
});

router.put('/:id', (req, res) => {
  const { section_title, content } = req.body || {};
  const db = getDb();
  const row = db.prepare('SELECT ss.id FROM script_sections ss JOIN musicals m ON m.id = ss.musical_id WHERE ss.id = ? AND m.user_id = ?').get(req.params.id, req.userId);
  if (!row) {
    db.close();
    return res.status(404).json({ error: 'Script section not found' });
  }
  const updates = []; const values = [];
  if (section_title !== undefined) { updates.push('section_title = ?'); values.push(section_title); }
  if (content !== undefined) { updates.push('content = ?'); values.push(content); }
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);
  db.prepare(`UPDATE script_sections SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  db.close();
  res.json({ ok: true });
});

export default router;
