import { type SQLiteDatabase } from 'expo-sqlite';
import { SEEDS, toFullPark } from '../constants/StateParksSeed';

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const CACHE_KEY = 'wikidata_planner_sync_v2';
const SEED_KEY = 'wikidata_seed_loaded_v1';
const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 25_000;

const QID_TYPES = [
  { qid: 'Q179049', designation: 'State Park' },
  { qid: 'Q1439621', designation: 'State Forest' },
  { qid: 'Q2074892', designation: 'State Beach' },
  { qid: 'Q2319595', designation: 'State Recreation Area' },
  { qid: 'Q7598388', designation: 'State Natural Area' },
];

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

async function loadSeedParks(db: SQLiteDatabase): Promise<void> {
  const already = await getCache(db, SEED_KEY);
  if (already) return;

  const now = Date.now();
  for (const seed of SEEDS) {
    const park = toFullPark(seed);
    await db.runAsync(
      `INSERT OR IGNORE INTO parks
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

  await setCache(db, SEED_KEY, { value: String(SEEDS.length), timestamp: now });
}

function buildQuery(qid: string): string {
  return `
SELECT DISTINCT ?park ?parkLabel ?coord ?stateAbbr ?image WHERE {
  ?park wdt:P31 wd:${qid} .
  ?park wdt:P17 wd:Q30 .
  OPTIONAL { ?park wdt:P625 ?coord . }
  OPTIONAL { ?park wdt:P18 ?image . }
  OPTIONAL {
    { ?park wdt:P131 ?loc . } UNION { ?park wdt:P131 ?mid . ?mid wdt:P131 ?loc . }
    ?loc wdt:P300 ?stateAbbr .
    FILTER(STRSTARTS(?stateAbbr, "US-"))
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 3000
`.trim();
}

function parseCoord(point: string): { lat: number; lon: number } | null {
  const match = point.match(/Point\(([+-]?\d+\.?\d*)\s+([+-]?\d+\.?\d*)\)/);
  if (!match) return null;
  return { lon: parseFloat(match[1]), lat: parseFloat(match[2]) };
}

interface SparqlBinding {
  park: { value: string };
  parkLabel?: { value: string };
  coord?: { value: string };
  stateAbbr?: { value: string };
  image?: { value: string };
}

interface ParsedWdPark {
  qid: string;
  label: string;
  lat: number;
  lon: number;
  stateAbbr: string | null;
  imageUrl: string | null;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchQidParks(qid: string): Promise<Map<string, ParsedWdPark>> {
  const query = buildQuery(qid);
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/sparql-results+json',
        'User-Agent': 'ParkPlannerApp/1.0 (educational project)',
      },
    });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(`Wikidata SPARQL error: ${response.status}`);
  }

  const data = (await response.json()) as {
    results?: { bindings?: SparqlBinding[] };
  };
  const bindings: SparqlBinding[] = data.results?.bindings ?? [];

  const parkMap = new Map<string, ParsedWdPark>();

  for (const binding of bindings) {
    if (!binding.coord?.value) continue;

    const coord = parseCoord(binding.coord.value);
    if (!coord) continue;

    const qidVal = binding.park.value.split('/').pop()!;
    const label = binding.parkLabel?.value ?? qidVal;
    const stateAbbr = binding.stateAbbr?.value?.replace('US-', '') ?? null;
    const rawImageUrl = binding.image?.value ?? null;

    const existing = parkMap.get(qidVal);
    if (existing?.stateAbbr && !stateAbbr) continue;

    let imageUrl: string | null = null;
    if (rawImageUrl) {
      const filename = rawImageUrl.split('/').pop();
      if (filename) {
        imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=800`;
      }
    }

    parkMap.set(qidVal, { qid: qidVal, label, lat: coord.lat, lon: coord.lon, stateAbbr, imageUrl });
  }

  return parkMap;
}

export async function syncStateParksFromWikidata(
  db: SQLiteDatabase,
  progressCallback?: (msg: string | null) => void,
): Promise<void> {
  // Always load bundled seeds first so state parks appear immediately
  await loadSeedParks(db);

  const cache = await getCache(db, CACHE_KEY);
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION_MS) {
    return;
  }

  const now = Date.now();
  let totalInserted = 0;

  for (let i = 0; i < QID_TYPES.length; i++) {
    const { qid, designation } = QID_TYPES[i];
    if (i > 0) await delay(1000);

    progressCallback?.(`Loading ${designation}s…`);

    try {
      const parkMap = await fetchQidParks(qid);

      for (const park of parkMap.values()) {
        await db.runAsync(
          `INSERT OR IGNORE INTO parks
            (id, source, full_name, description, state_codes, latitude, longitude,
             designation, image_url, activities, entrance_fee_cents, raw_json, last_synced)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `wd_${park.qid}`,
            'state',
            park.label,
            '',
            park.stateAbbr ?? '',
            park.lat,
            park.lon,
            designation,
            park.imageUrl,
            '[]',
            0,
            JSON.stringify({ qid: park.qid, designation }),
            now,
          ],
        );
        totalInserted++;
      }

      progressCallback?.(`Loaded ${parkMap.size} ${designation}s`);
    } catch (err) {
      console.warn(`Failed to sync ${designation}:`, err);
    }
  }

  await setCache(db, CACHE_KEY, { value: String(totalInserted), timestamp: now });
  progressCallback?.(null);
}
