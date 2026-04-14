import { type SQLiteDatabase } from 'expo-sqlite';

const NPS_API_KEY =
  process.env.EXPO_PUBLIC_NPS_API_KEY ?? 'RZY4aIrQ5963UKF6M8Yde34McZDrHWqcZtnE3IdA';
const CACHE_KEY = 'nps_planner_sync_v1';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

const OFFICIAL_PARK_CODES = new Set([
  'acad', 'arch', 'badl', 'bibe', 'bisc', 'blca', 'brca', 'cany', 'care', 'cave',
  'chis', 'cong', 'crla', 'cuva', 'dena', 'deva', 'drto', 'ever', 'gaar', 'jeff',
  'glac', 'glba', 'grca', 'grte', 'grba', 'grsa', 'grsm', 'gumo', 'hale', 'havo',
  'hosp', 'indu', 'isro', 'jotr', 'katm', 'kefj', 'seki', 'kova', 'lacl', 'lavo',
  'maca', 'meve', 'mora', 'neri', 'noca', 'olym', 'pefo', 'pinn', 'redw', 'romo',
  'sagu', 'shen', 'thro', 'viis', 'voya', 'whsa', 'wica', 'wrst', 'yell', 'yose',
  'zion', 'npsa',
]);

interface CacheEntry {
  value: string;
  timestamp: number;
}

async function getCache(db: SQLiteDatabase, key: string): Promise<CacheEntry | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM kv_store WHERE key = ?',
    [key],
  );
  if (!row) return null;
  try {
    return JSON.parse(row.value) as CacheEntry;
  } catch {
    return null;
  }
}

async function setCache(db: SQLiteDatabase, key: string, data: CacheEntry): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)',
    [key, JSON.stringify(data)],
  );
}

interface RawNpsPark {
  parkCode: string;
  fullName: string;
  description: string;
  states: string;
  latitude: string;
  longitude: string;
  designation: string;
  images?: Array<{ url: string }>;
  activities?: Array<{ name: string }>;
  entranceFees?: Array<{ cost: string; description: string; title: string }>;
}

interface ParsedPark {
  id: string;
  source: string;
  fullName: string;
  description: string;
  stateCodes: string;
  latitude: number | null;
  longitude: number | null;
  designation: string;
  imageUrl: string | null;
  activities: string[];
  entranceFeeCents: number;
  rawJson: string;
}

function parseNpsPark(raw: RawNpsPark, overrideCode?: string, overrideName?: string): ParsedPark {
  const lat = raw.latitude ? parseFloat(raw.latitude) : null;
  const lon = raw.longitude ? parseFloat(raw.longitude) : null;
  const activities = raw.activities?.map((a) => a.name) ?? [];
  const entranceFee = raw.entranceFees?.[0]?.cost;
  const entranceFeeCents = entranceFee ? Math.round(parseFloat(entranceFee) * 100) : 0;
  const imageUrl = raw.images?.[0]?.url ?? null;
  const code = overrideCode ?? raw.parkCode;

  return {
    id: `nps_${code}`,
    source: 'nps',
    fullName: overrideName ?? raw.fullName,
    description: raw.description ?? '',
    stateCodes: raw.states ?? '',
    latitude: isNaN(lat as number) ? null : lat,
    longitude: isNaN(lon as number) ? null : lon,
    designation: raw.designation ?? 'National Park',
    imageUrl,
    activities,
    entranceFeeCents,
    rawJson: JSON.stringify(raw),
  };
}

export async function syncNpsParks(db: SQLiteDatabase): Promise<void> {
  const cache = await getCache(db, CACHE_KEY);
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION_MS) {
    return;
  }

  const url = `https://developer.nps.gov/api/v1/parks?limit=500&api_key=${NPS_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`NPS API error: ${response.status}`);
  }

  const data = (await response.json()) as { data?: RawNpsPark[] };
  const rawParks: RawNpsPark[] = data.data ?? [];

  const filtered = rawParks.filter((p) =>
    OFFICIAL_PARK_CODES.has(p.parkCode.toLowerCase()),
  );

  const parksToInsert: ParsedPark[] = [];

  for (const raw of filtered) {
    if (raw.parkCode.toLowerCase() === 'seki') {
      parksToInsert.push(parseNpsPark(raw, 'seki_sequoia', 'Sequoia National Park'));
      parksToInsert.push(parseNpsPark(raw, 'seki_kings', 'Kings Canyon National Park'));
    } else {
      parksToInsert.push(parseNpsPark(raw));
    }
  }

  const now = Date.now();
  for (const park of parksToInsert) {
    await db.runAsync(
      `INSERT OR REPLACE INTO parks
        (id, source, full_name, description, state_codes, latitude, longitude,
         designation, image_url, activities, entrance_fee_cents, raw_json, last_synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        park.id,
        park.source,
        park.fullName,
        park.description,
        park.stateCodes,
        park.latitude,
        park.longitude,
        park.designation,
        park.imageUrl,
        JSON.stringify(park.activities),
        park.entranceFeeCents,
        park.rawJson,
        now,
      ],
    );
  }

  await setCache(db, CACHE_KEY, { value: 'done', timestamp: now });
}
