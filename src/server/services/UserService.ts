import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface User {
  id: string;
  username: string;
  email?: string;
  isGuest: boolean;
  createdAt: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  email?: string;
}

class UserService {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(__dirname, '..', 'database', 'digital_humans.db');
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = 1000');
    this.db.pragma('foreign_keys = ON');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT,
        password_hash TEXT,
        isGuest INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const { username, password, email } = userData;
    
    const existingUser = this.db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, email, password_hash, isGuest)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, username, email || null, passwordHash, 0);

    return {
      id,
      username,
      email,
      isGuest: false,
      createdAt
    };
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    const row = stmt.get(username) as any;

    if (!row || !row.password_hash) {
      return null;
    }

    const isValid = await bcrypt.compare(password, row.password_hash);
    if (!isValid) {
      return null;
    }

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      isGuest: Boolean(row.isGuest),
      createdAt: row.created_at
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      isGuest: Boolean(row.isGuest),
      createdAt: row.created_at
    };
  }

  async createGuestUser(): Promise<User> {
    const guestUsername = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, isGuest)
      VALUES (?, ?, ?)
    `);

    stmt.run(id, guestUsername, 1);

    return {
      id,
      username: guestUsername,
      isGuest: true,
      createdAt
    };
  }
}

export default new UserService();
