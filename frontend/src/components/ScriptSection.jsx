import React, { useState, useEffect } from 'react';
import { getScriptSections, createScriptSection, updateScriptSection } from '../api';
import MusicalPicker from './MusicalPicker';

export default function ScriptSection({ musicals = [], musicalId, onSelectMusical }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!musicalId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getScriptSections(musicalId)
      .then((list) => {
        if (list.length === 0) {
          return createScriptSection({ musical_id: musicalId }).then((created) => [created]);
        }
        return list;
      })
      .then(setSections)
      .finally(() => setLoading(false));
  }, [musicalId]);

  const section = sections[0];
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (section) setContent(section.content || '');
  }, [section?.id]);

  const save = async () => {
    if (!section || saving) return;
    setSaving(true);
    try {
      await updateScriptSection(section.id, { content });
      setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, content } : s)));
    } finally {
      setSaving(false);
    }
  };

  // Auto-save after user stops typing for 1.5s (only when content actually changed from loaded value)
  useEffect(() => {
    if (!section || content === (section.content || '')) return;
    const t = setTimeout(save, 1500);
    return () => clearTimeout(t);
  }, [content]);

  if (musicals.length === 0) return <div className="card">Create a musical in Story first.</div>;
  if (!musicalId) {
    return (
      <div className="script-section">
        <h1 className="page-title gold">Script</h1>
        <p className="muted" style={{ marginBottom: '1.5rem' }}>Write your book (dialogue and stage directions).</p>
        <div className="card">
          <p className="muted" style={{ marginBottom: '1rem' }}>Select a musical to work on.</p>
          <MusicalPicker musicals={musicals} value={musicalId} onChange={onSelectMusical} />
        </div>
      </div>
    );
  }
  if (loading) return <div className="card">Loading script…</div>;
  if (!section) return <div className="card">No script section. Try refreshing.</div>;

  return (
    <div className="script-section">
      <h1 className="page-title gold">Script</h1>
      <p className="muted" style={{ marginBottom: '1rem' }}>Write your book (dialogue and stage directions).</p>
      <div className="musical-picker-wrap">
        <MusicalPicker musicals={musicals} value={musicalId} onChange={onSelectMusical} />
      </div>

      <div className="card script-card">
        <div className="script-toolbar">
          <span className="muted">{saving ? 'Saving…' : 'Auto-saves when you pause typing.'}</span>
        </div>
        <textarea
          className="script-textarea"
          placeholder="INT. OPENING SCENE — Day\n\nCHARACTER: Your first line here…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={save}
          spellCheck
        />
      </div>
    </div>
  );
}
