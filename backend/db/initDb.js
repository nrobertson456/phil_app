/**
 * Initialize the SQLite database and create tables if they don't exist.
 * getDb() returns a connection; call initDb() once on server start.
 */
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'broadway.db');

export function getDb() {
  return new Database(dbPath);
}

export function initDb() {
  const db = getDb();
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
  try {
    db.exec("ALTER TABLE users ADD COLUMN display_name TEXT DEFAULT ''");
  } catch (e) {
    if (!e.message?.includes('duplicate')) throw e;
  }
  db.close();
}
