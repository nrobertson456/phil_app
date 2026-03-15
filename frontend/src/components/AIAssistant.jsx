import React, { useState } from 'react';
import { getAISuggestion } from '../api';
import MusicalPicker from './MusicalPicker';

const SUGGEST_TYPES = [
  { value: 'plot', label: 'Plot / next beat' },
  { value: 'character', label: 'Character depth' },
  { value: 'song', label: 'Song idea' },
  { value: 'dialogue', label: 'Dialogue / line' },
];

export default function AIAssistant({ musicals = [], musicalId, onSelectMusical }) {
  const [context, setContext] = useState('');
  const [type, setType] = useState('plot');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuggestion('');
    try {
      const { suggestion: text } = await getAISuggestion(context, type);
      setSuggestion(text);
    } catch (err) {
      setSuggestion('Could not get a suggestion. Check that the backend is running and, if you use AI, that OPENAI_API_KEY is set.');
    } finally {
      setLoading(false);
    }
  };

  if (musicals.length === 0) return <div className="card">Create a musical in Story first.</div>;
  if (!musicalId) {
    return (
      <div className="ai-assistant">
        <h1 className="page-title gold">AI Writing Assistant</h1>
        <p className="muted" style={{ marginBottom: '1rem' }}>Stuck? Describe where you're at and get a short idea to unstick you.</p>
        <div className="card">
          <p className="muted" style={{ marginBottom: '1rem' }}>Select a musical to work on.</p>
          <MusicalPicker musicals={musicals} value={musicalId} onChange={onSelectMusical} />
        </div>
      </div>
    );
  }

  return (
    <div className="ai-assistant">
      <h1 className="page-title gold">AI Writing Assistant</h1>
      <p className="muted" style={{ marginBottom: '1rem' }}>Stuck? Describe where you’re at and get a short idea to unstick you.</p>

      <div className="musical-picker-wrap">
        <MusicalPicker musicals={musicals} value={musicalId} onChange={onSelectMusical} />
      </div>

      <div className="card">
        <h2>What do you need help with?</h2>
        <form onSubmit={ask}>
          <label>
            Context (what’s the scene, who’s there, what’s the problem?)
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. Act 2. The hero just discovered the villain is her father. She’s alone on stage. I need a reaction that feels big but not melodramatic."
            rows={4}
          />
          <label>Suggestion type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text)',
              marginBottom: '1rem',
            }}
          >
            {SUGGEST_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-gold" disabled={loading}>
            {loading ? 'Thinking…' : 'Get suggestion'}
          </button>
        </form>
      </div>

      {suggestion && (
        <div className="card suggestion-card">
          <h2>Suggestion</h2>
          <p className="suggestion-text">{suggestion}</p>
        </div>
      )}
    </div>
  );
}
