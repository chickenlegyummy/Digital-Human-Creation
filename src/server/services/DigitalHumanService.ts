import Database from 'better-sqlite3';
import { DigitalHuman } from '../types/interfaces.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DigitalHumanService {
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
      CREATE TABLE IF NOT EXISTS digital_humans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        systemPrompt TEXT NOT NULL,
        imageUrl TEXT,
        isPublic INTEGER DEFAULT 0,
        createdBy TEXT,
        personality TEXT,
        background TEXT,
        expertise TEXT,
        communicationStyle TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_digital_humans_created_by ON digital_humans(createdBy);
      CREATE INDEX IF NOT EXISTS idx_digital_humans_public ON digital_humans(isPublic);
    `);
  }

  async createDigitalHuman(digitalHuman: Omit<DigitalHuman, 'id' | 'createdAt'>): Promise<DigitalHuman> {
    const stmt = this.db.prepare(`
      INSERT INTO digital_humans (
        id, name, description, systemPrompt, imageUrl, isPublic, createdBy,
        personality, background, expertise, communicationStyle
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const id = `dh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    stmt.run(
      id,
      digitalHuman.name,
      digitalHuman.description,
      digitalHuman.systemPrompt,
      digitalHuman.imageUrl || null,
      digitalHuman.isPublic ? 1 : 0,
      digitalHuman.createdBy || null,
      digitalHuman.personality || null,
      digitalHuman.background || null,
      digitalHuman.expertise || null,
      digitalHuman.communicationStyle || null
    );

    return {
      ...digitalHuman,
      id,
      createdAt
    };
  }

  async getDigitalHumanById(id: string): Promise<DigitalHuman | null> {
    const stmt = this.db.prepare('SELECT * FROM digital_humans WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      systemPrompt: row.systemPrompt,
      imageUrl: row.imageUrl,
      isPublic: Boolean(row.isPublic),
      createdBy: row.createdBy,
      personality: row.personality,
      background: row.background,
      expertise: row.expertise,
      communicationStyle: row.communicationStyle,
      createdAt: row.created_at
    };
  }

  async getAllDigitalHumans(userId?: string): Promise<DigitalHuman[]> {
    let query = 'SELECT * FROM digital_humans';
    const params: any[] = [];

    if (userId) {
      query += ' WHERE isPublic = 1 OR createdBy = ?';
      params.push(userId);
    } else {
      query += ' WHERE isPublic = 1';
    }

    query += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      systemPrompt: row.systemPrompt,
      imageUrl: row.imageUrl,
      isPublic: Boolean(row.isPublic),
      createdBy: row.createdBy,
      personality: row.personality,
      background: row.background,
      expertise: row.expertise,
      communicationStyle: row.communicationStyle,
      createdAt: row.created_at
    }));
  }

  async searchDigitalHumans(query: string, userId?: string): Promise<DigitalHuman[]> {
    let sqlQuery = `
      SELECT * FROM digital_humans 
      WHERE (name LIKE ? OR description LIKE ? OR personality LIKE ? OR background LIKE ?)
    `;
    const params = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

    if (userId) {
      sqlQuery += ' AND (isPublic = 1 OR createdBy = ?)';
      params.push(userId);
    } else {
      sqlQuery += ' AND isPublic = 1';
    }

    sqlQuery += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(sqlQuery);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      systemPrompt: row.systemPrompt,
      imageUrl: row.imageUrl,
      isPublic: Boolean(row.isPublic),
      createdBy: row.createdBy,
      personality: row.personality,
      background: row.background,
      expertise: row.expertise,
      communicationStyle: row.communicationStyle,
      createdAt: row.created_at
    }));
  }

  async updateDigitalHuman(id: string, updates: Partial<DigitalHuman>): Promise<DigitalHuman | null> {
    const existingHuman = await this.getDigitalHumanById(id);
    if (!existingHuman) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.systemPrompt !== undefined) {
      fields.push('systemPrompt = ?');
      values.push(updates.systemPrompt);
    }
    if (updates.imageUrl !== undefined) {
      fields.push('imageUrl = ?');
      values.push(updates.imageUrl);
    }
    if (updates.isPublic !== undefined) {
      fields.push('isPublic = ?');
      values.push(updates.isPublic ? 1 : 0);
    }

    if (fields.length === 0) return existingHuman;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE digital_humans 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `);

    stmt.run(...values);
    return await this.getDigitalHumanById(id);
  }

  async deleteDigitalHuman(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM digital_humans WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async togglePublicStatus(id: string): Promise<DigitalHuman | null> {
    const existing = await this.getDigitalHumanById(id);
    if (!existing) return null;

    const stmt = this.db.prepare('UPDATE digital_humans SET isPublic = ? WHERE id = ?');
    stmt.run(existing.isPublic ? 0 : 1, id);
    
    return await this.getDigitalHumanById(id);
  }

  async generateDigitalHuman(prompt: string, userId?: string): Promise<DigitalHuman> {
    // AI generation logic - for now using a smart template system
    // In production, this would call AI APIs like DeepSeek
    
    const templates = [
      {
        name: "Alex the Helper",
        description: "A friendly and helpful AI assistant that loves to solve problems and provide support.",
        systemPrompt: "You are Alex, a warm and helpful AI assistant. You're patient, encouraging, and always ready to help users with their questions and tasks. You have a positive attitude and enjoy making complex topics easy to understand.",
        personality: "Friendly, patient, encouraging",
        background: "AI assistant specialized in helping users solve problems",
        expertise: "General assistance, problem-solving, explanations",
        communicationStyle: "Warm, clear, and supportive"
      },
      {
        name: "Sophia the Wise",
        description: "A thoughtful AI mentor with deep knowledge and philosophical insights.",
        systemPrompt: "You are Sophia, a wise and thoughtful AI mentor. You provide deep insights, ask thought-provoking questions, and help users explore complex topics with nuance and wisdom.",
        personality: "Wise, thoughtful, philosophical",
        background: "AI mentor with broad knowledge and experience",
        expertise: "Philosophy, deep thinking, mentorship",
        communicationStyle: "Thoughtful, questioning, insightful"
      },
      {
        name: "Maya the Creative",
        description: "An imaginative AI artist and creative collaborator full of innovative ideas.",
        systemPrompt: "You are Maya, a creative and imaginative AI artist. You're full of innovative ideas, love to explore artistic concepts, and help users tap into their creative potential.",
        personality: "Creative, imaginative, inspiring",
        background: "AI artist and creative collaborator",
        expertise: "Art, creativity, innovation, design",
        communicationStyle: "Inspiring, energetic, artistic"
      }
    ];

    // Simple prompt-based selection for demo
    let selectedTemplate = templates[0]; // Default
    
    if (prompt.toLowerCase().includes('wise') || prompt.toLowerCase().includes('mentor') || prompt.toLowerCase().includes('philosophy')) {
      selectedTemplate = templates[1];
    } else if (prompt.toLowerCase().includes('creative') || prompt.toLowerCase().includes('art') || prompt.toLowerCase().includes('design')) {
      selectedTemplate = templates[2];
    }

    // Add some variation based on the prompt
    const customizedName = prompt.length > 50 ? 
      selectedTemplate.name.replace(/Alex|Sophia|Maya/, `${selectedTemplate.name.split(' ')[0]} (Custom)`) :
      selectedTemplate.name;

    const digitalHuman: Omit<DigitalHuman, 'id' | 'createdAt'> = {
      name: customizedName,
      description: selectedTemplate.description + ` Created based on: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`,
      systemPrompt: selectedTemplate.systemPrompt,
      imageUrl: undefined,
      isPublic: false,
      createdBy: userId || undefined,
      personality: selectedTemplate.personality,
      background: selectedTemplate.background,
      expertise: selectedTemplate.expertise,
      communicationStyle: selectedTemplate.communicationStyle
    };

    return await this.createDigitalHuman(digitalHuman);
  }
}

export default new DigitalHumanService();
