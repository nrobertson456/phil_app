import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getProfile, updateProfile } from '../api';
import './Profile.css';

const NOTE_COUNT = 18;

export default function Profile({ musicalCount = 0 }) {
  const { user, updateUser } = useAuth();
  const email = user?.email || '';
  const savedDisplayName = user?.displayName ?? '';
  const [displayName, setDisplayName] = useState(savedDisplayName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(!savedDisplayName);

  useEffect(() => {
    setDisplayName(savedDisplayName);
    if (savedDisplayName) {
      setIsEditing(false);
    }
  }, [savedDisplayName]);

  const handleSaveName = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { display_name } = await updateProfile({ display_name: displayName.trim() });
      updateUser({ displayName: display_name || '' });
      setDisplayName('');
      setMessage('Saved!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const showName = (displayName || savedDisplayName || '').trim() || 'Writer';

  return (
    <div className="profile-page">
      <div className="profile-banner">
        <div className="profile-banner-gold" />
        <div className="profile-notes" aria-hidden="true">
          <div className="profile-notes-layer">
            {[...Array(NOTE_COUNT)].map((_, idx) => {
              const baseLeft = (idx / (NOTE_COUNT - 1)) * 100;
              const row = idx % 4; // stagger a few vertical rows
              const top = 15 + row * 18;
              return (
                <div
                  key={idx}
                  className="profile-note"
                  data-variant={idx % 4}
                  style={{
                    '--note-i': idx,
                    left: `${baseLeft}%`,
                    top: `${top}%`,
                  }}
                >
                  {idx % 4 === 0 ? '♪' : idx % 4 === 1 ? '♫' : idx % 4 === 2 ? '♩' : '♬'}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <h1 className="page-title gold">Profile</h1>
        <div className="card profile-card">
          <div className="profile-avatar" aria-hidden="true">
            {showName.charAt(0)}
          </div>
          <form onSubmit={handleSaveName} className="profile-name-form">
            <label htmlFor="profile-username">Display name</label>
            {isEditing ? (
              <div className="profile-name-row">
                <input
                  id="profile-username"
                  type="text"
                  className="profile-name-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Your name"
                  maxLength={100}
                />
                <button type="submit" className="btn btn-gold" disabled={saving || !displayName.trim()}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            ) : (
              <div className="profile-name-row profile-name-display-row">
                <div className="profile-name-display">
                  {showName}
                </div>
                <button
                  type="button"
                  className="btn profile-name-edit-btn"
                  onClick={() => {
                    setDisplayName(showName === 'Writer' ? '' : showName);
                    setIsEditing(true);
                  }}
                >
                  ✎ Edit
                </button>
              </div>
            )}
            {message && <p className={'profile-save-msg ' + (message === 'Saved!' ? 'profile-save-msg-ok' : '')}>{message}</p>}
          </form>
          <p className="profile-email">{email}</p>
          <dl className="profile-stats">
            <dt>Musicals written</dt>
            <dd>{musicalCount}</dd>
          </dl>
        </div>
        <NavLink to="/" className="btn btn-gold">Back to Story</NavLink>
      </div>
    </div>
  );
}
