import { type SQLiteDatabase } from 'expo-sqlite';
import { SEEDS, toFullPark } from '../constants/StateParksSeed';

const SEED_KEY = 'seed_loaded_v4';

async function isSeedLoaded(db: SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM kv_store WHERE key = ?',
    [SEED_KEY],
  );
  return !!row;
}

// Escape single quotes for SQL string literals
function escapeSQL(str: string | null): string {
  if (str === null) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

export async function syncStateParksFromWikidata(
  db: SQLiteDatabase,
  progressCallback?: (msg: string | null) => void,
): Promise<void> {
  if (await isSeedLoaded(db)) return;

  progressCallback?.('Loading state parks…');
  const now = Date.now();

  // Build all INSERT statements as a single SQL string for bulk execution
  const statements: string[] = [
    "DELETE FROM parks WHERE source = 'state';",
  ];

  for (const seed of SEEDS) {
    const park = toFullPark(seed);
    statements.push(
      `INSERT INTO parks (id, source, full_name, description, state_codes, latitude, longitude, designation, image_url, activities, entrance_fee_cents, raw_json, last_synced) VALUES (${escapeSQL(park.id)}, ${escapeSQL(park.source)}, ${escapeSQL(park.fullName)}, ${escapeSQL(park.description)}, ${escapeSQL(park.stateCodes)}, ${park.latitude ?? 'NULL'}, ${park.longitude ?? 'NULL'}, ${escapeSQL(park.designation)}, ${escapeSQL(park.imageUrl)}, ${escapeSQL(JSON.stringify(park.activities))}, ${park.entranceFeeCents}, ${escapeSQL(park.rawJson)}, ${now});`
    );
  }

  statements.push(
    `INSERT OR REPLACE INTO kv_store (key, value) VALUES ('${SEED_KEY}', '${now}');`
  );

  // Execute all statements at once - this is atomic and fast
  await db.execAsync(statements.join('\n'));

  progressCallback?.(null);
}
