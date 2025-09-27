import sqlite3 from 'better-sqlite3';
import path from 'node:path';

const dbPath = path.resolve('./data/parking.db');
const db = new sqlite3(dbPath);

// Создаем таблицы
db.exec(`
  CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY,
    chat_id TEXT UNIQUE,
    parking_spot INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS parking_history (
    id INTEGER PRIMARY KEY,
    spot_number INTEGER,
    status TEXT, -- 'free' или 'occupied'
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;