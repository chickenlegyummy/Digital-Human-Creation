import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'digital_human.db');

// Initialize database with optimized settings
const db = new Database(dbPath, {
  verbose: console.log,
  fileMustExist: false
});

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 1000000');
db.pragma('temp_store = memory');

// Create tables if they don't exist
const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_guest INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Digital humans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS digital_humans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      personality TEXT NOT NULL,
      appearance TEXT NOT NULL,
      voice_settings TEXT NOT NULL,
      is_public INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Chat messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      digital_human_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      response TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (digital_human_id) REFERENCES digital_humans (id) ON DELETE CASCADE
    )
  `);

  // Public content table
  db.exec(`
    CREATE TABLE IF NOT EXISTS public_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      digital_human_id INTEGER NOT NULL,
      content_type TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (digital_human_id) REFERENCES digital_humans (id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables created successfully');
};

// Initialize database
createTables();

export default db;
