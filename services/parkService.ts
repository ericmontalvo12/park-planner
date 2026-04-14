import { type SQLiteDatabase } from 'expo-sqlite';
import { type Park, type Plan } from '../types';

export function rowToPark(row: Record<string, unknown>): Park {
  return {
    id: row.id as string,
    source: row.source as 'nps' | 'state',
    fullName: row.full_name as string,
    description: (row.description as string) ?? '',
    stateCodes: (row.state_codes as string) ?? '',
    latitude: row.latitude as number | null,
    longitude: row.longitude as number | null,
    designation: (row.designation as string) ?? '',
    imageUrl: row.image_url as string | null,
    activities: JSON.parse((row.activities as string) ?? '[]') as string[],
    entranceFeeCents: (row.entrance_fee_cents as number) ?? 0,
    rawJson: (row.raw_json as string) ?? '',
    lastSynced: (row.last_synced as number) ?? 0,
  };
}

export function rowToPlan(row: Record<string, unknown>): Plan {
  return {
    id: row.id as number,
    name: row.name as string,
    preferences: JSON.parse(row.preferences as string),
    resultIds: JSON.parse(row.result_ids as string),
    createdAt: row.created_at as number,
  };
}

export async function getAllParks(db: SQLiteDatabase): Promise<Park[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>('SELECT * FROM parks');
  return rows.map(rowToPark);
}

export async function getParkById(db: SQLiteDatabase, id: string): Promise<Park | null> {
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM parks WHERE id = ?',
    [id],
  );
  return row ? rowToPark(row) : null;
}

export async function getAllPlans(db: SQLiteDatabase): Promise<Plan[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM plans ORDER BY created_at DESC',
  );
  return rows.map(rowToPlan);
}

export async function savePlan(
  db: SQLiteDatabase,
  name: string,
  preferences: string,
  resultIds: string[],
): Promise<void> {
  await db.runAsync(
    'INSERT INTO plans (name, preferences, result_ids, created_at) VALUES (?, ?, ?, ?)',
    [name, preferences, JSON.stringify(resultIds), Date.now()],
  );
}

export async function deletePlan(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM plans WHERE id = ?', [id]);
}

export async function getPreferences(db: SQLiteDatabase): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM kv_store WHERE key = 'user_preferences'",
  );
  return row?.value ?? null;
}

export async function savePreferences(db: SQLiteDatabase, prefs: string): Promise<void> {
  await db.runAsync(
    "INSERT OR REPLACE INTO kv_store (key, value) VALUES ('user_preferences', ?)",
    [prefs],
  );
}
