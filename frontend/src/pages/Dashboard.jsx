import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getMusicals } from '../api';
import StoryBuilder from '../components/StoryBuilder';
import CharacterCreator from '../components/CharacterCreator';
import SongPlanner from '../components/SongPlanner';
import ScriptSection from '../components/ScriptSection';
import AIAssistant from '../components/AIAssistant';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [musicals, setMusicals] = useState([]);
  const [currentMusicalId, setCurrentMusicalId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const list = await getMusicals();
        if (!cancelled) {
          setMusicals(list);
          if (list.length > 0 && !currentMusicalId) setCurrentMusicalId(list[0].id);
          // Don't auto-create when empty; user creates musicals by clicking Save on Story page
        }
      } catch (err) {
        if (err.message === 'Login required') logout();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">Loading your musical…</div>
      </div>
    );
  }

  const navItems = [
    { to: '/', label: 'Story', end: true },
    { to: '/characters', label: 'Characters', end: false },
    { to: '/songs', label: 'Songs', end: false },
    { to: '/script', label: 'Script', end: false },
    { to: '/assistant', label: 'AI Assistant', end: false },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-logo">Curtain Call</h1>
          <p className="sidebar-tagline">Musical Writer</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-email">{user?.email}</span>
          <button type="button" className="btn btn-ghost" onClick={() => { logout(); navigate('/login'); }}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<StoryBuilder musicals={musicals} currentMusicalId={currentMusicalId} onSelectMusical={setCurrentMusicalId} onMusicalUpdate={() => getMusicals().then(setMusicals)} />} />
          <Route path="/characters" element={<CharacterCreator musicalId={currentMusicalId} />} />
          <Route path="/songs" element={<SongPlanner musicalId={currentMusicalId} />} />
          <Route path="/script" element={<ScriptSection musicalId={currentMusicalId} />} />
          <Route path="/assistant" element={<AIAssistant musicalId={currentMusicalId} />} />
        </Routes>
      </main>
    </div>
  );
}
