-- Broadway App Database Schema
-- Run this once; the server will create tables on first run if needed.

-- Users table: stores email and hashed password
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Musical projects: title, premise, plot (one per user, or we allow multiple)
CREATE TABLE IF NOT EXISTS musicals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT DEFAULT '',
  premise TEXT DEFAULT '',
  plot TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Characters in a musical
CREATE TABLE IF NOT EXISTS characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  musical_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  role TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (musical_id) REFERENCES musicals(id)
);

-- Song planner: song title, placement, notes
CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  musical_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  act_number INTEGER DEFAULT 1,
  scene_number INTEGER DEFAULT 1,
  notes TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (musical_id) REFERENCES musicals(id)
);

-- Script content (can be one big script or per-act)
CREATE TABLE IF NOT EXISTS script_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  musical_id INTEGER NOT NULL,
  section_title TEXT DEFAULT 'Script',
  content TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (musical_id) REFERENCES musicals(id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_musicals_user ON musicals(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_musical ON characters(musical_id);
CREATE INDEX IF NOT EXISTS idx_songs_musical ON songs(musical_id);
CREATE INDEX IF NOT EXISTS idx_script_musical ON script_sections(musical_id);
