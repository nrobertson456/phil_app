import React, { useState, useEffect } from 'react';
import { getMusical, updateMusical } from '../api';

export default function StoryBuilder({ musicalId, onMusicalUpdate }) {
  const [title, setTitle] = useState('');
  const [premise, setPremise] = useState('');
  const [plot, setPlot] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!musicalId) return;
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
    if (!musicalId) return;
    setSaving(true);
    try {
      await updateMusical(musicalId, { title, premise, plot });
      onMusicalUpdate?.();
    } finally {
      setSaving(false);
    }
  };

  if (!musicalId) return <div className="card">Select or create a musical to get started.</div>;
  if (!loaded) return <div className="card">Loading story…</div>;

  return (
    <div className="story-builder">
      <h1 className="page-title gold">Story Builder</h1>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>Define your musical’s title, premise, and plot.</p>

      <div className="card">
        <label>Title</label>
        <input
          type="text"
          placeholder="e.g. The Phantom of the Opera"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
        />
        <label>Premise (one or two sentences)</label>
        <textarea
          placeholder="What is your musical about? Who is it for?"
          value={premise}
          onChange={(e) => setPremise(e.target.value)}
          onBlur={save}
          rows={3}
        />
        <label>Plot (outline or full synopsis)</label>
        <textarea
          placeholder="Outline your story: acts, key scenes, turning points…"
          value={plot}
          onChange={(e) => setPlot(e.target.value)}
          onBlur={save}
          rows={12}
        />
        {saving && <span className="muted" style={{ fontSize: '0.85rem' }}>Saving…</span>}
      </div>
    </div>
  );
}
