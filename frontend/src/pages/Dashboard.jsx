import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getMusicals } from '../api';
import StoryBuilder from '../components/StoryBuilder';
import CharacterCreator from '../components/CharacterCreator';
import SongPlanner from '../components/SongPlanner';
import ScriptSection from '../components/ScriptSection';
import AIAssistant from '../components/AIAssistant';
import Profile from './Profile';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [musicals, setMusicals] = useState([]);
  const [currentMusicalId, setCurrentMusicalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [mobileDrawerLayout, setMobileDrawerLayout] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  );

  const closeNav = useCallback(() => setNavOpen(false), []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = () => {
      setMobileDrawerLayout(mq.matches);
      if (!mq.matches) setNavOpen(false);
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    closeNav();
  }, [location.pathname, closeNav]);

  useEffect(() => {
    if (!navOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeNav();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen, closeNav]);

  useEffect(() => {
    if (navOpen) {
      document.body.classList.add('dashboard-nav-open');
    } else {
      document.body.classList.remove('dashboard-nav-open');
    }
    return () => document.body.classList.remove('dashboard-nav-open');
  }, [navOpen]);

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
      <header className="mobile-top-bar">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setNavOpen((o) => !o)}
          aria-expanded={navOpen}
          aria-controls="dashboard-sidebar"
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
        >
          <span className={`mobile-menu-burger${navOpen ? ' mobile-menu-burger--open' : ''}`} aria-hidden>
            <span className="mobile-menu-burger-line" />
            <span className="mobile-menu-burger-line" />
            <span className="mobile-menu-burger-line" />
          </span>
        </button>
        <span className="mobile-top-bar-title">Curtain Call</span>
      </header>

      <div
        className={`sidebar-backdrop${navOpen ? ' sidebar-backdrop--visible' : ''}`}
        onClick={closeNav}
        role="presentation"
        aria-hidden={!navOpen}
      />

      <aside
        id="dashboard-sidebar"
        className={`sidebar${navOpen ? ' sidebar--open' : ''}`}
        aria-hidden={mobileDrawerLayout && !navOpen ? true : undefined}
      >
        <div className="sidebar-header">
          <h1 className="sidebar-logo">Curtain Call</h1>
          <p className="sidebar-tagline">Musical Writer</p>
        </div>
        <nav className="sidebar-nav" aria-label="Primary">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
              onClick={closeNav}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink
            to="/profile"
            className={({ isActive }) => 'sidebar-profile-btn' + (isActive ? ' active' : '')}
            end
            title="View profile"
            onClick={closeNav}
          >
            <span className="sidebar-profile-email">{user?.email}</span>
          </NavLink>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              closeNav();
              logout();
              navigate('/login');
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="main-content" id="dashboard-main">
        <Routes>
          <Route path="/" element={<StoryBuilder musicals={musicals} currentMusicalId={currentMusicalId} onSelectMusical={setCurrentMusicalId} onMusicalUpdate={() => getMusicals().then(setMusicals)} />} />
          <Route path="/characters" element={<CharacterCreator musicals={musicals} musicalId={currentMusicalId} onSelectMusical={setCurrentMusicalId} />} />
          <Route path="/songs" element={<SongPlanner musicals={musicals} musicalId={currentMusicalId} onSelectMusical={setCurrentMusicalId} />} />
          <Route path="/script" element={<ScriptSection musicals={musicals} musicalId={currentMusicalId} onSelectMusical={setCurrentMusicalId} />} />
          <Route path="/assistant" element={<AIAssistant musicals={musicals} musicalId={currentMusicalId} onSelectMusical={setCurrentMusicalId} />} />
          <Route path="/profile" element={<Profile musicalCount={musicals.length} />} />
        </Routes>
      </main>
    </div>
  );
}
