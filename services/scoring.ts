import { type Park, type Preferences } from '../types';

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const SCENERY_KEYWORDS: Record<string, string[]> = {
  Mountains: ['mountain', 'alpine', 'peak', 'summit', 'rocky', 'sierra', 'cascade', 'teton', 'olympic', 'denali', 'rainier'],
  'Ocean/Coast': ['coast', 'coastal', 'ocean', 'sea', 'shore', 'beach', 'seashore', 'cape', 'island', 'biscayne', 'acadia', 'channel', 'virgin', 'dry tortugas'],
  Desert: ['desert', 'arid', 'badlands', 'mesa', 'saguaro', 'joshua', 'mojave', 'chihuahuan', 'death valley'],
  Forest: ['forest', 'redwood', 'sequoia', 'woodland', 'rainforest', 'conifer', 'spruce', 'pine', 'olympic'],
  'Lakes/Rivers': ['lake', 'river', 'waterway', 'water', 'falls', 'stream', 'creek', 'basin', 'reservoir', 'voyageurs'],
  Canyons: ['canyon', 'gorge', 'ravine', 'chasm', 'gulch', 'bryce', 'zion', 'canyonlands', 'grand canyon', 'black canyon'],
  Glaciers: ['glacier', 'glacial', 'kenai', 'denali', 'rainier', 'north cascades', 'wrangell'],
  'Wetlands/Swamps': ['wetland', 'swamp', 'marsh', 'everglades', 'bog', 'bayou', 'congaree'],
  'Prairie/Grassland': ['prairie', 'grassland', 'plain', 'savanna', 'great plains', 'theodore roosevelt'],
  Volcanic: ['volcanic', 'volcano', 'lava', 'crater', 'caldera', 'hawaii', 'katmai', 'craters of the moon'],
  Tropical: ['tropical', 'hawaii', 'rainforest', 'coral', 'reef', 'virgin islands', 'american samoa'],
  Tundra: ['tundra', 'arctic', 'denali', 'alaska', 'gates of the arctic', 'kobuk'],
  Caves: ['cave', 'cavern', 'mammoth', 'carlsbad', 'jewel', 'wind'],
  Waterfalls: ['falls', 'waterfall', 'cascade', 'yosemite', 'olympic'],
  Dunes: ['dune', 'sand', 'great sand', 'white sands', 'indiana'],
  Meadows: ['meadow', 'valley', 'shenandoah', 'great smoky'],
  Cliffs: ['cliff', 'arch', 'mesa', 'rim', 'pinnacles', 'arches', 'petrified', 'painted'],
  'Hot Springs': ['hot spring', 'thermal', 'geyser', 'yellowstone', 'hot springs'],
};

function intersectionCount(a: string[], b: string[]): number {
  const bSet = new Set(b.map((s) => s.toLowerCase()));
  return a.filter((s) => bSet.has(s.toLowerCase())).length;
}

export function getMatchedActivities(park: Park, prefs: Preferences): string[] {
  const selected = new Set(
    [...prefs.activities, ...prefs.campingStyles].map((s) => s.toLowerCase()),
  );
  return park.activities.filter((a) => selected.has(a.toLowerCase()));
}

function scoreScenery(park: Park, vibes: string[]): number {
  if (vibes.length === 0) return 0;
  const haystack = (
    park.fullName +
    ' ' +
    park.designation +
    ' ' +
    park.description.slice(0, 300)
  ).toLowerCase();
  let matches = 0;
  for (const vibe of vibes) {
    const keywords = SCENERY_KEYWORDS[vibe] ?? [];
    if (keywords.some((kw) => haystack.includes(kw))) {
      matches++;
    }
  }
  return matches / vibes.length;
}

export function scorePark(park: Park, prefs: Preferences): number {
  const hasActivities = prefs.activities.length > 0;
  const hasCamping = prefs.campingStyles.length > 0;
  const hasScenery = prefs.sceneryVibes.length > 0;

  const activityScore = hasActivities
    ? intersectionCount(park.activities, prefs.activities) / prefs.activities.length
    : 0;

  const campingScore = hasCamping
    ? intersectionCount(park.activities, prefs.campingStyles) / prefs.campingStyles.length
    : 0;

  const sceneryScore = hasScenery ? scoreScenery(park, prefs.sceneryVibes) : 0;

  const activityWeight = hasActivities ? 0.45 : 0;
  const campingWeight = hasCamping ? 0.25 : 0;
  const sceneryWeight = hasScenery ? 0.30 : 0;
  const totalWeight = activityWeight + campingWeight + sceneryWeight || 1;

  return (
    (activityScore * activityWeight +
      campingScore * campingWeight +
      sceneryScore * sceneryWeight) /
    totalWeight
  );
}

export function rankParks(
  parks: Park[],
  prefs: Preferences,
  lat?: number,
  lon?: number,
): Park[] {
  // 1. State filter — only show parks in the selected state
  let filtered = parks;
  if (prefs.locationState) {
    const state = prefs.locationState.toUpperCase();
    filtered = filtered.filter((p) =>
      p.stateCodes.split(',').map((s) => s.trim().toUpperCase()).includes(state),
    );
  }

  // 2. Budget filter
  if (prefs.budget === 'free') {
    filtered = filtered.filter((p) => p.entranceFeeCents === 0);
  } else if (prefs.budget === 'under15') {
    filtered = filtered.filter((p) => p.entranceFeeCents <= 1500);
  } else if (prefs.budget === 'under30') {
    filtered = filtered.filter((p) => p.entranceFeeCents <= 3000);
  }

  // 3. Score each park
  const scored = filtered.map((park) => ({
    park,
    score: scorePark(park, prefs),
    distance:
      lat != null && lon != null && park.latitude != null && park.longitude != null
        ? haversineKm(lat, lon, park.latitude, park.longitude)
        : Infinity,
  }));

  // 3. Sort by score desc, then distance asc
  scored.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.001) return b.score - a.score;
    return a.distance - b.distance;
  });

  // 4. Return top 50
  return scored.slice(0, 50).map((s) => s.park);
}
