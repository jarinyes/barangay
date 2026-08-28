import pg from 'pg';
import bcrypt from 'bcrypt';
import { SEED_USERS } from '../data/seedData.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export async function getDb(): Promise<pg.Pool> {
  if (pool) return pool;

  pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  await initializeDb(pool);
  return pool;
}

async function initializeDb(dbPool: pg.Pool) {
  // Create users table
  await dbPool.query(`
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
  const res = await dbPool.query('SELECT COUNT(*) as count FROM users');
  const userCount = parseInt(res.rows[0].count, 10);
  
  if (userCount === 0) {
    console.log('Seeding initial users into database...');
    
    for (const user of SEED_USERS) {
      // In seedData.ts, users might still have 'passcode' during transition, but we'll use a default if missing
      const plainPassword = (user as any).passcode || 'jarinyes';
      const saltRounds = 10;
      const passcodeHash = await bcrypt.hash(plainPassword, saltRounds);

      await dbPool.query(
        `INSERT INTO users (
          id, name, role, agencyType, agencyName, barangay, position, 
          badgeOrIdNumber, email, passcodeHash, phone, address, avatarUrl
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
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
