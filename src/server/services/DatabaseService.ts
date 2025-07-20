import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface StoredDigitalHuman {
  id: string;
  user_id: number;
  name: string;
  prompt: string;
  rules: string; // JSON string
  personality: string;
  temperature: number;
  max_tokens: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: number;
  digital_human_id: string;
  created_at: string;
  updated_at: string;
}

export interface StoredChatMessage {
  id: string;
  chat_session_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export class DatabaseService {
  private db: sqlite3.Database;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(__dirname, '../../database/digital_humans.db');
    
    // Ensure directory exists
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    this.db = new sqlite3.Database(this.dbPath);
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Users table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Digital humans table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS digital_humans (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            prompt TEXT NOT NULL,
            rules TEXT NOT NULL,
            personality TEXT NOT NULL,
            temperature REAL DEFAULT 0.7,
            max_tokens INTEGER DEFAULT 1000,
            is_public BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);

        // Chat sessions table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            digital_human_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (digital_human_id) REFERENCES digital_humans (id)
          )
        `);

        // Chat messages table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS chat_messages (
            id TEXT PRIMARY KEY,
            chat_session_id TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (chat_session_id) REFERENCES chat_sessions (id)
          )
        `, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('✅ Database initialized successfully');
            resolve();
          }
        });
      });
    });
  }

  // User management methods
  async createUser(username: string, email: string, hashedPassword: string): Promise<User> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO users (username, email, password)
        VALUES (?, ?, ?)
      `);

      stmt.run(username, email, hashedPassword, function(err) {
        if (err) {
          reject(err);
        } else {
          stmt.finalize();
          resolve({
            id: this.lastID,
            username,
            email,
            password: hashedPassword,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row: User) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row: User) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  // Digital human management methods
  async saveDigitalHuman(digitalHuman: any, userId: number): Promise<StoredDigitalHuman> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO digital_humans 
        (id, user_id, name, prompt, rules, personality, temperature, max_tokens, is_public, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      stmt.run(
        digitalHuman.id,
        userId,
        digitalHuman.name,
        digitalHuman.prompt,
        JSON.stringify(digitalHuman.rules),
        digitalHuman.personality,
        digitalHuman.temperature,
        digitalHuman.maxTokens,
        digitalHuman.isPublic || false,
        function(err) {
          if (err) {
            reject(err);
          } else {
            stmt.finalize();
            resolve({
              id: digitalHuman.id,
              user_id: userId,
              name: digitalHuman.name,
              prompt: digitalHuman.prompt,
              rules: JSON.stringify(digitalHuman.rules),
              personality: digitalHuman.personality,
              temperature: digitalHuman.temperature,
              max_tokens: digitalHuman.maxTokens,
              is_public: digitalHuman.isPublic || false,
              created_at: digitalHuman.createdAt || new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }
      );
    });
  }

  async getUserDigitalHumans(userId: number): Promise<StoredDigitalHuman[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM digital_humans WHERE user_id = ? ORDER BY updated_at DESC',
        [userId],
        (err, rows: StoredDigitalHuman[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  async getPublicDigitalHumans(): Promise<StoredDigitalHuman[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM digital_humans WHERE is_public = TRUE ORDER BY updated_at DESC LIMIT 50',
        (err, rows: StoredDigitalHuman[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  async getAllDigitalHumans(): Promise<StoredDigitalHuman[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM digital_humans ORDER BY updated_at DESC',
        (err, rows: StoredDigitalHuman[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  async getDigitalHumanById(id: string): Promise<StoredDigitalHuman | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM digital_humans WHERE id = ?',
        [id],
        (err, row: StoredDigitalHuman) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  async deleteDigitalHuman(id: string, userId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM digital_humans WHERE id = ? AND user_id = ?',
        [id, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  // Chat session management
  async getOrCreateChatSession(userId: number, digitalHumanId: string): Promise<ChatSession> {
    return new Promise((resolve, reject) => {
      // First try to find existing session
      this.db.get(
        'SELECT * FROM chat_sessions WHERE user_id = ? AND digital_human_id = ?',
        [userId, digitalHumanId],
        async (err, row: ChatSession) => {
          if (err) {
            reject(err);
          } else if (row) {
            // Update the session timestamp
            this.db.run(
              'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              [row.id]
            );
            resolve(row);
          } else {
            // Create new session
            try {
              const newSession = await this.createChatSession(userId, digitalHumanId);
              resolve(newSession);
            } catch (error) {
              reject(error);
            }
          }
        }
      );
    });
  }

  async createChatSession(userId: number, digitalHumanId: string): Promise<ChatSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO chat_sessions (id, user_id, digital_human_id)
        VALUES (?, ?, ?)
      `);

      stmt.run(sessionId, userId, digitalHumanId, function(err) {
        if (err) {
          reject(err);
        } else {
          stmt.finalize();
          resolve({
            id: sessionId,
            user_id: userId,
            digital_human_id: digitalHumanId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });
    });
  }

  async saveChatMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<StoredChatMessage> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO chat_messages (id, chat_session_id, role, content)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run(messageId, sessionId, role, content, function(err) {
        if (err) {
          reject(err);
        } else {
          stmt.finalize();
          resolve({
            id: messageId,
            chat_session_id: sessionId,
            role,
            content,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
  }

  async getChatMessages(sessionId: string): Promise<StoredChatMessage[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM chat_messages WHERE chat_session_id = ? ORDER BY timestamp ASC',
        [sessionId],
        (err, rows: StoredChatMessage[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  async getUserChatSessions(userId: number): Promise<ChatSession[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC',
        [userId],
        (err, rows: ChatSession[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
