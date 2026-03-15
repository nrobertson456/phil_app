import React, { useState, useEffect } from 'react';
import { getMusical, createMusical, updateMusical, deleteMusical } from '../api';

export default function StoryBuilder({ musicals = [], currentMusicalId: musicalId, onSelectMusical, onMusicalUpdate }) {
  const [title, setTitle] = useState('');
  const [premise, setPremise] = useState('');
  const [plot, setPlot] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!musicalId) return;
    setLoaded(false);
    let cancelled = false;
    getMusical(musicalId).then((data) => {
      if (!cancelled) {
        setTitle(data.title || '');
        setPremise(data.premise || '');
        setPlot(data.plot || '');
        setLoaded(true);
      }
    }).catch(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [musicalId]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this musical?')) return;
    try {
      await deleteMusical(id);
      await onMusicalUpdate?.();
      if (id === musicalId) {
        setTitle('');
        setPremise('');
        setPlot('');
        onSelectMusical?.(null);
      }
    } catch (err) {
      // could show error toast
    }
  };

  const startNewMusical = () => {
    setTitle('');
    setPremise('');
    setPlot('');
    onSelectMusical?.(null);
  };

  const save = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      if (musicalId) {
        await updateMusical(musicalId, { title, premise, plot });
        await onMusicalUpdate?.();
      } else {
        await createMusical({ title, premise, plot });
        await onMusicalUpdate?.();
        setTitle('');
        setPremise('');
        setPlot('');
        onSelectMusical?.(null);
      }
      setSaveMessage('Saved! ✨');
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  if (musicalId && !loaded) return <div className="card">Loading story…</div>;

  return (
    <div className="story-builder">
      <h1 className="page-title gold">Story Builder</h1>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>Define your musical’s title, premise, and plot.</p>

      <div className="story-builder-top-actions">
        <button type="button" className="btn btn-ghost btn-new-musical" onClick={startNewMusical}>
          + New Musical
        </button>
      </div>

      {musicals.length > 0 && (
        <section className="my-musicals" aria-label="My musicals">
          <h2 className="my-musicals-title">My Musicals</h2>
          <div className="my-musicals-grid">
            {musicals.map((m) => (
              <div
                key={m.id}
                role="button"
                tabIndex={0}
                className={'my-musical-card' + (m.id === musicalId ? ' active' : '')}
                onClick={() => onSelectMusical?.(m.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectMusical?.(m.id); } }}
              >
                <span className="my-musical-card-title">{m.title || 'Untitled Musical'}</span>
                <button
                  type="button"
                  className="my-musical-card-delete"
                  aria-label="Delete musical"
                  onClick={(e) => handleDelete(e, m.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="card">
        <label>Title</label>
        <input
          type="text"
          placeholder="e.g. The Phantom of the Opera"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label>Premise (one or two sentences)</label>
        <textarea
          placeholder="What is your musical about? Who is it for?"
          value={premise}
          onChange={(e) => setPremise(e.target.value)}
          rows={3}
        />
        <label>Plot (outline or full synopsis)</label>
        <textarea
          placeholder="Outline your story: acts, key scenes, turning points…"
          value={plot}
          onChange={(e) => setPlot(e.target.value)}
          rows={12}
        />
        <div className="story-builder-actions">
          <button
            type="button"
            className="btn btn-gold"
            onClick={save}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saveMessage && (
            <span className="save-confirmation save-confirmation-success" role="status">{saveMessage}</span>
          )}
        </div>
      </div>
    </div>
  );
}
