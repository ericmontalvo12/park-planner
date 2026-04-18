import { type SQLiteDatabase } from 'expo-sqlite';
import { SEEDS, toFullPark } from '../constants/StateParksSeed';

const SEED_KEY = 'seed_loaded_v1';

async function isSeedLoaded(db: SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM kv_store WHERE key = ?',
    [SEED_KEY],
  );
  return !!row;
}

export async function syncStateParksFromWikidata(
  db: SQLiteDatabase,
  progressCallback?: (msg: string | null) => void,
): Promise<void> {
  if (await isSeedLoaded(db)) return;

  progressCallback?.('Loading state parks…');
  const now = Date.now();

  for (const seed of SEEDS) {
    const park = toFullPark(seed);
    await db.runAsync(
      `INSERT OR IGNORE INTO parks
        (id, source, full_name, description, state_codes, latitude, longitude,
         designation, image_url, activities, entrance_fee_cents, raw_json, last_synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        park.id, park.source, park.fullName, park.description,
        park.stateCodes, park.latitude, park.longitude, park.designation,
        park.imageUrl, JSON.stringify(park.activities),
        park.entranceFeeCents, park.rawJson, now,
      ],
    );
  }

  await db.runAsync(
    'INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)',
    [SEED_KEY, String(now)],
  );

  progressCallback?.(null);
}
