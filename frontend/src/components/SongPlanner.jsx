import React, { useState, useEffect } from 'react';
import { getSongs, createSong, updateSong, deleteSong } from '../api';
import MusicalPicker from './MusicalPicker';

export default function SongPlanner({ musicals = [], musicalId, onSelectMusical }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newAct, setNewAct] = useState(1);
  const [newScene, setNewScene] = useState(1);
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    if (!musicalId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getSongs(musicalId).then(setSongs).finally(() => setLoading(false));
  }, [musicalId]);

  const addSong = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !musicalId) return;
    try {
      const created = await createSong({
        musical_id: musicalId,
        title: newTitle.trim(),
        act_number: newAct,
        scene_number: newScene,
        notes: newNotes.trim(),
      });
      setSongs((prev) => [...prev, created]);
      setNewTitle('');
      setNewNotes('');
    } catch (err) {
      alert(err.message);
    }
  };

  const update = async (id, field, value) => {
    const song = songs.find((s) => s.id === id);
    if (!song) return;
    try {
      await updateSong(id, { ...song, [field]: value });
      setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    } catch (err) {
      alert(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Remove this song from the plan?')) return;
    try {
      await deleteSong(id);
      setSongs((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (musicals.length === 0) return <div className="card">Create a musical in Story first.</div>;
  if (!musicalId) {
    return (
      <div className="song-planner">
        <h1 className="page-title gold">Song Planner</h1>
        <p className="muted" style={{ marginBottom: '1.5rem' }}>Plan where each song sits in your show (act, scene, notes).</p>
        <div className="card">
          <p className="muted" style={{ marginBottom: '1rem' }}>Select a musical to work on.</p>
          <MusicalPicker musicals={musicals} value={musicalId} onChange={onSelectMusical} />
        </div>
      </div>
    );
  }
  if (loading) return <div className="card">Loading songs…</div>;

  return (
    <div className="song-planner">
      <h1 className="page-title gold">Song Planner</h1>
      <p className="muted" style={{ marginBottom: '1rem' }}>Plan where each song sits in your show (act, scene, notes).</p>
      <div className="musical-picker-wrap">
        <MusicalPicker musicals={musicals} value={musicalId} onChange={onSelectMusical} />
      </div>

      <div className="card">
        <h2>Add song</h2>
        <form onSubmit={addSong} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <label style={{ flex: '1 1 220px', marginBottom: 0 }}>
            Song title
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Opening Number" required />
          </label>
          <label style={{ width: '80px', marginBottom: 0 }}>
            Act
            <input type="number" min={1} value={newAct} onChange={(e) => setNewAct(Number(e.target.value))} />
          </label>
          <label style={{ width: '80px', marginBottom: 0 }}>
            Scene
            <input type="number" min={1} value={newScene} onChange={(e) => setNewScene(Number(e.target.value))} />
          </label>
          <label style={{ flex: '1 1 100%', marginBottom: 0 }}>
            Notes
            <input type="text" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Mood, purpose, who sings…" />
          </label>
          <button type="submit" className="btn btn-gold">Add</button>
        </form>
      </div>

      <div className="card">
        <h2>Song list</h2>
        {songs.length === 0 ? (
          <p className="muted">No songs planned yet. Add one above.</p>
        ) : (
          <ul className="song-list">
            {songs.map((s) => (
              <li key={s.id} className="song-item">
                <div className="song-header">
                  <input
                    type="text"
                    value={s.title}
                    onChange={(e) => update(s.id, 'title', e.target.value)}
                    className="song-title-input"
                  />
                  <span className="song-act-scene">Act {s.act_number}, Scene {s.scene_number}</span>
                  <input
                    type="number"
                    min={1}
                    value={s.act_number}
                    onChange={(e) => update(s.id, 'act_number', Number(e.target.value))}
                    className="song-act-input"
                  />
                  <input
                    type="number"
                    min={1}
                    value={s.scene_number}
                    onChange={(e) => update(s.id, 'scene_number', Number(e.target.value))}
                    className="song-scene-input"
                  />
                  <button type="button" className="btn btn-small btn-danger" onClick={() => remove(s.id)}>Remove</button>
                </div>
                <input
                  type="text"
                  value={s.notes || ''}
                  onChange={(e) => update(s.id, 'notes', e.target.value)}
                  placeholder="Notes (mood, who sings…)"
                  className="song-notes-input"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
