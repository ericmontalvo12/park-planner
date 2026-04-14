import { type SQLiteDatabase } from 'expo-sqlite';

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const CACHE_KEY = 'wikidata_planner_sync_v1';
const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

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

function buildQuery(qid: string): string {
  return `
SELECT DISTINCT ?park ?parkLabel ?coord ?stateAbbr ?image WHERE {
  ?park wdt:P31/wdt:P279* wd:${qid} .
  ?park wdt:P17 wd:Q30 .
  OPTIONAL { ?park wdt:P625 ?coord . }
  OPTIONAL { ?park wdt:P18 ?image . }
  OPTIONAL {
    { ?park wdt:P131 ?loc . } UNION { ?park wdt:P131 ?mid . ?mid wdt:P131 ?loc . }
    ?loc wdt:P300 ?stateAbbr .
    FILTER(STRSTARTS(?stateAbbr, "US-"))
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 5000
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

async function fetchQidParks(qid: string): Promise<Map<string, ParsedWdPark>> {
  const query = buildQuery(qid);
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': 'ParkPlannerApp/1.0 (educational project)',
    },
  });

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

    // Prefer rows with state codes
    const existing = parkMap.get(qidVal);
    if (existing?.stateAbbr && !stateAbbr) continue;

    // Convert Wikimedia Commons filename to thumbnail URL
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
  const cache = await getCache(db, CACHE_KEY);
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION_MS) {
    return;
  }

  const now = Date.now();
  let totalInserted = 0;

  for (const { qid, designation } of QID_TYPES) {
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
