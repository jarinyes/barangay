import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Need to resolve .env correctly depending on where the script is run
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { SEED_CASES, SEED_AUDIT_LOGS, SEED_NOTIFICATIONS } from '../src/data/seedData';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('Starting data migration to Supabase...');

  try {
    // 1. Insert Cases
    console.log(`Inserting ${SEED_CASES.length} cases...`);
    for (const c of SEED_CASES) {
      const { error } = await supabase.from('cases').upsert(c);
      if (error) {
        console.error(`Error inserting case ${c.id}:`, error.message);
      }
    }
    console.log('Cases inserted successfully.');

    // 2. Insert Audit Logs
    console.log(`Inserting ${SEED_AUDIT_LOGS.length} audit logs...`);
    for (const log of SEED_AUDIT_LOGS) {
      const { error } = await supabase.from('audit_logs').upsert(log);
      if (error) {
        console.error(`Error inserting audit log ${log.id}:`, error.message);
      }
    }
    console.log('Audit logs inserted successfully.');

    // 3. Insert Notifications
    console.log(`Inserting ${SEED_NOTIFICATIONS.length} notifications...`);
    for (const notif of SEED_NOTIFICATIONS) {
      const { error } = await supabase.from('notifications').upsert(notif);
      if (error) {
        console.error(`Error inserting notification ${notif.id}:`, error.message);
      }
    }
    console.log('Notifications inserted successfully.');

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

seedDatabase();
