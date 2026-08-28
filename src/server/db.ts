import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_USERS } from '../data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../users.db');

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await initializeDb(db);
  return db;
}

async function initializeDb(database: Database) {
  // Create users table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      agencyType TEXT NOT NULL,
      agencyName TEXT NOT NULL,
      barangay TEXT,
      position TEXT,
      badgeOrIdNumber TEXT,
      email TEXT UNIQUE NOT NULL,
      passcodeHash TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      avatarUrl TEXT
    )
  `);

  // Check if users exist
  const userCount = await database.get('SELECT COUNT(*) as count FROM users');
  
  if (userCount.count === 0) {
    console.log('Seeding initial users into database...');
    
    for (const user of SEED_USERS) {
      // In seedData.ts, users might still have 'passcode' during transition, but we'll use a default if missing
      const plainPassword = (user as any).passcode || 'jarinyes';
      const saltRounds = 10;
      const passcodeHash = await bcrypt.hash(plainPassword, saltRounds);

      await database.run(
        `INSERT INTO users (
          id, name, role, agencyType, agencyName, barangay, position, 
          badgeOrIdNumber, email, passcodeHash, phone, address, avatarUrl
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.name,
          user.role,
          user.agencyType,
          user.agencyName,
          user.barangay || null,
          user.position || null,
          user.badgeOrIdNumber || null,
          user.email,
          passcodeHash,
          user.phone || null,
          user.address || null,
          user.avatarUrl || null
        ]
      );
    }
    console.log('Database seeded successfully.');
  }
}
