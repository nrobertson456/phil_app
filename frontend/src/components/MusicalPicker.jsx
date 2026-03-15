import React from 'react';

/**
 * Dropdown to select which musical to work on. Used on Characters, Songs, Script, AI Assistant.
 */
export default function MusicalPicker({ musicals = [], value, onChange, label = 'Work on musical' }) {
  if (musicals.length === 0) return null;

  const handleChange = (e) => {
    const v = e.target.value;
    onChange(v ? Number(v) : null);
  };

  return (
    <div className="musical-picker">
      <label htmlFor="musical-picker-select" className="musical-picker-label">
        {label}
      </label>
      <select
        id="musical-picker-select"
        className="musical-picker-select"
        value={value ?? ''}
        onChange={handleChange}
        aria-label={label}
      >
        <option value="">Select a musical…</option>
        {musicals.map((m) => (
          <option key={m.id} value={m.id}>
            {m.title || 'Untitled Musical'}
          </option>
        ))}
      </select>
    </div>
  );
}
