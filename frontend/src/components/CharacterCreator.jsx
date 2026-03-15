import React, { useState, useEffect } from 'react';
import { getCharacters, createCharacter, updateCharacter, deleteCharacter } from '../api';
import MusicalPicker from './MusicalPicker';

export default function CharacterCreator({ musicals = [], musicalId, onSelectMusical }) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    if (!musicalId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getCharacters(musicalId).then(setCharacters).finally(() => setLoading(false));
  }, [musicalId]);

  const addCharacter = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !musicalId) return;
    try {
      const created = await createCharacter({
        musical_id: musicalId,
        name: newName.trim(),
        description: newDesc.trim(),
        role: newRole.trim(),
      });
      setCharacters((prev) => [...prev, { ...created, description: newDesc, role: newRole }]);
      setNewName('');
      setNewDesc('');
      setNewRole('');
    } catch (err) {
      alert(err.message);
    }
  };

  const update = async (id, field, value) => {
    const ch = characters.find((c) => c.id === id);
    if (!ch) return;
    try {
      await updateCharacter(id, { ...ch, [field]: value });
      setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
    } catch (err) {
      alert(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this character?')) return;
    try {
      await deleteCharacter(id);
      setCharacters((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (musicals.length === 0) return <div className="card">Create a musical in Story first.</div>;
  if (!musicalId) {
    return (
      <div className="character-creator">
        <h1 className="page-title gold">Character Creator</h1>
        <p className="muted" style={{ marginBottom: '1.5rem' }}>Add and develop the characters in your musical.</p>
        <div className="card">
          <p className="muted" style={{ marginBottom: '1rem' }}>Select a musical to work on.</p>
          <MusicalPicker musicals={musicals} value={musicalId} onChange={onSelectMusical} />
        </div>
      </div>
    );
  }
  if (loading) return <div className="card">Loading characters…</div>;

  return (
    <div className="character-creator">
      <h1 className="page-title gold">Character Creator</h1>
      <p className="muted" style={{ marginBottom: '1rem' }}>Add and develop the characters in your musical.</p>
      <div className="musical-picker-wrap">
        <MusicalPicker musicals={musicals} value={musicalId} onChange={onSelectMusical} />
      </div>

      <div className="card">
        <h2>Add character</h2>
        <form onSubmit={addCharacter} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <label style={{ flex: '1 1 200px', marginBottom: 0 }}>
            Name
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Character name" required />
          </label>
          <label style={{ flex: '1 1 200px', marginBottom: 0 }}>
            Role / type
            <input type="text" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="e.g. Lead, Antagonist" />
          </label>
          <label style={{ flex: '1 1 100%', marginBottom: 0 }}>
            Description
            <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Short description or arc" />
          </label>
          <button type="submit" className="btn btn-gold">Add</button>
        </form>
      </div>

      <div className="card">
        <h2>Your characters</h2>
        {characters.length === 0 ? (
          <p className="muted">No characters yet. Add one above.</p>
        ) : (
          <ul className="character-list">
            {characters.map((ch) => (
              <li key={ch.id} className="character-item">
                <div className="character-main">
                  <input
                    type="text"
                    value={ch.name}
                    onChange={(e) => update(ch.id, 'name', e.target.value)}
                    onFocus={() => setEditingId(ch.id)}
                    onBlur={() => setEditingId(null)}
                    className="character-name-input"
                  />
                  {ch.role && <span className="character-role">{ch.role}</span>}
                </div>
                <input
                  type="text"
                  value={ch.description}
                  onChange={(e) => update(ch.id, 'description', e.target.value)}
                  placeholder="Description"
                  className="character-desc-input"
                />
                <button type="button" className="btn btn-small btn-danger" onClick={() => remove(ch.id)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
