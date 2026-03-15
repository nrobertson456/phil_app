import React, { useState, useEffect } from 'react';
import { getMusical, createMusical } from '../api';

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

  const save = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await createMusical({ title, premise, plot });
      await onMusicalUpdate?.();
      setTitle('');
      setPremise('');
      setPlot('');
      onSelectMusical?.(null);
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

      {musicals.length > 0 && (
        <section className="my-musicals" aria-label="My musicals">
          <h2 className="my-musicals-title">My Musicals</h2>
          <div className="my-musicals-grid">
            {musicals.map((m) => (
              <button
                key={m.id}
                type="button"
                className={'my-musical-card' + (m.id === musicalId ? ' active' : '')}
                onClick={() => onSelectMusical?.(m.id)}
              >
                <span className="my-musical-card-title">{m.title || 'Untitled Musical'}</span>
              </button>
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
