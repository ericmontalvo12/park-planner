import { type SQLiteDatabase } from 'expo-sqlite';

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS parks (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      full_name TEXT NOT NULL,
      description TEXT DEFAULT '',
      state_codes TEXT DEFAULT '',
      latitude REAL,
      longitude REAL,
      designation TEXT DEFAULT '',
      image_url TEXT,
      activities TEXT DEFAULT '[]',
      entrance_fee_cents INTEGER DEFAULT 0,
      raw_json TEXT DEFAULT '',
      last_synced INTEGER
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      preferences TEXT NOT NULL,
      result_ids TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Remove any state parks loaded by previous versions — app is NPS-only now
  await db.runAsync("DELETE FROM parks WHERE source = 'state'");
  await db.runAsync("DELETE FROM kv_store WHERE key LIKE 'seed_loaded%'");
}
