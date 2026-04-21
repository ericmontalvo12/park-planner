import { type Park, type Preferences } from '../types';

export function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const SCENERY_KEYWORDS: Record<string, string[]> = {
  Mountains:          ['mountain', 'alpine', 'peak', 'summit', 'rocky', 'sierra', 'cascade', 'teton', 'olympic', 'denali', 'rainier'],
  'Ocean/Coast':      ['coast', 'coastal', 'ocean', 'sea', 'shore', 'beach', 'seashore', 'cape', 'island', 'biscayne', 'acadia', 'channel', 'virgin', 'dry tortugas'],
  Desert:             ['desert', 'arid', 'badlands', 'mesa', 'saguaro', 'joshua', 'mojave', 'chihuahuan', 'death valley'],
  Forest:             ['forest', 'redwood', 'sequoia', 'woodland', 'rainforest', 'conifer', 'spruce', 'pine', 'olympic'],
  'Lakes/Rivers':     ['lake', 'river', 'waterway', 'water', 'falls', 'stream', 'creek', 'basin', 'reservoir', 'voyageurs'],
  Canyons:            ['canyon', 'gorge', 'ravine', 'chasm', 'gulch', 'bryce', 'zion', 'canyonlands', 'grand canyon', 'black canyon'],
  Glaciers:           ['glacier', 'glacial', 'kenai', 'denali', 'rainier', 'north cascades', 'wrangell'],
  'Wetlands/Swamps':  ['wetland', 'swamp', 'marsh', 'everglades', 'bog', 'bayou', 'congaree'],
  'Prairie/Grassland':['prairie', 'grassland', 'plain', 'savanna', 'great plains', 'theodore roosevelt'],
  Volcanic:           ['volcanic', 'volcano', 'lava', 'crater', 'caldera', 'hawaii', 'katmai', 'craters of the moon'],
  Tropical:           ['tropical', 'hawaii', 'rainforest', 'coral', 'reef', 'virgin islands', 'american samoa'],
  Tundra:             ['tundra', 'arctic', 'denali', 'alaska', 'gates of the arctic', 'kobuk'],
  Caves:              ['cave', 'cavern', 'mammoth', 'carlsbad', 'jewel', 'wind'],
  Waterfalls:         ['falls', 'waterfall', 'cascade', 'yosemite', 'olympic'],
  Dunes:              ['dune', 'sand', 'great sand', 'white sands', 'indiana'],
  Meadows:            ['meadow', 'valley', 'shenandoah', 'great smoky'],
  Cliffs:             ['cliff', 'arch', 'mesa', 'rim', 'pinnacles', 'arches', 'petrified', 'painted'],
  'Hot Springs':      ['hot spring', 'thermal', 'geyser', 'yellowstone', 'hot springs'],
};

// Maps each app label → NPS API activity names that count as a match
const ACTIVITY_ALIASES: Record<string, string[]> = {
  'Hiking':                  ['Hiking'],
  'Camping':                 ['Camping', 'Backcountry Camping', 'Car or Front Country Camping', 'RV Camping', 'Group Camping'],
  'Swimming':                ['Swimming'],
  'Fishing':                 ['Fishing'],
  'Rock Climbing':           ['Rock Climbing', 'Climbing'],
  'Kayaking':                ['Kayaking', 'Paddling'],
  'Cycling':                 ['Bicycling', 'Cycling'],
  'Wildlife Viewing':        ['Wildlife Watching', 'Wildlife Viewing'],
  'Bird Watching':           ['Birdwatching', 'Bird Watching', 'Birding'],
  'Photography':             ['Photography'],
  'Stargazing':              ['Stargazing', 'Astronomy'],
  'Backpacking':             ['Backpacking', 'Backcountry Camping'],
  'Snowshoeing':             ['Snowshoeing'],
  'Cross-Country Skiing':    ['Cross-Country Skiing'],
  'Horseback Riding':        ['Horseback Riding'],
  'Snorkeling':              ['Snorkeling'],
  'Surfing':                 ['Surfing'],
  'Caving':                  ['Caving'],
  'Waterfall Chasing':       ['Hiking', 'Waterfall'],
  'Scenic Drives':           ['Scenic Driving', 'Scenic Drives'],
  'Picnicking':              ['Picnicking'],
  'Off-Roading':             ['Off-Road Driving', 'Motor Sports'],
  'Stand-Up Paddleboarding': ['Stand Up Paddleboarding', 'Paddleboarding', 'Paddling'],
  'Sailing':                 ['Sailing', 'Boating'],
  'Mountain Biking':         ['Mountain Biking', 'Biking'],
  'Hot Springs':             ['Hot Springs'],
  // Camping styles
  'Tent Camping':            ['Camping', 'Car or Front Country Camping'],
  'RV/Car Camping':          ['RV Camping', 'Car or Front Country Camping', 'Camping'],
  'Backcountry':             ['Backcountry Camping', 'Backpacking'],
  'Glamping':                ['Glamping'],
  'Cabin/Yurt':              ['Cabin Camping'],
  'Group Camping':           ['Group Camping'],
  'Beach Camping':           ['Beach Camping', 'Camping'],
  'Desert Camping':          ['Camping'],
  'Alpine Camping':          ['Backcountry Camping', 'Camping'],
  'Hammock Camping':         ['Hammock Camping'],
  'No Camping':              [],
};

function labelMatchesPark(label: string, parkActivitySet: Set<string>): boolean {
  const aliases = ACTIVITY_ALIASES[label]?.map((a) => a.toLowerCase()) ?? [label.toLowerCase()];
  return aliases.some((a) => parkActivitySet.has(a));
}

function matchCount(userLabels: string[], parkActivities: string[]): number {
  const parkSet = new Set(parkActivities.map((a) => a.toLowerCase()));
  return userLabels.filter((label) => labelMatchesPark(label, parkSet)).length;
}

export function getMatchedActivities(park: Park, prefs: Preferences): string[] {
  const parkSet = new Set(park.activities.map((a) => a.toLowerCase()));
  return [...prefs.activities, ...prefs.campingStyles].filter((label) =>
    labelMatchesPark(label, parkSet),
  );
}

function scoreScenery(park: Park, vibes: string[]): number {
  if (vibes.length === 0) return 0;
  const haystack = `${park.fullName} ${park.designation} ${park.description.slice(0, 300)}`.toLowerCase();
  const matches = vibes.filter((vibe) =>
    (SCENERY_KEYWORDS[vibe] ?? []).some((kw) => haystack.includes(kw)),
  ).length;
  return matches / vibes.length;
}

export function scorePark(park: Park, prefs: Preferences): number {
  const hasActivities = prefs.activities.length > 0;
  const hasCamping = prefs.campingStyles.length > 0;
  const hasScenery = prefs.sceneryVibes.length > 0;

  const activityScore = hasActivities
    ? matchCount(prefs.activities, park.activities) / prefs.activities.length
    : 0;
  const campingScore = hasCamping
    ? matchCount(prefs.campingStyles, park.activities) / prefs.campingStyles.length
    : 0;
  const sceneryScore = hasScenery ? scoreScenery(park, prefs.sceneryVibes) : 0;

  const activityWeight = hasActivities ? 0.45 : 0;
  const campingWeight = hasCamping ? 0.25 : 0;
  const sceneryWeight = hasScenery ? 0.30 : 0;
  const totalWeight = activityWeight + campingWeight + sceneryWeight || 1;

  return (
    activityScore * activityWeight +
    campingScore * campingWeight +
    sceneryScore * sceneryWeight
  ) / totalWeight;
}

export function rankParks(
  parks: Park[],
  prefs: Preferences,
  lat?: number,
  lon?: number,
): Park[] {
  // 1. State filter
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

  // 3. Score and sort
  const scored = filtered.map((park) => ({
    park,
    score: scorePark(park, prefs),
    distance:
      lat != null && lon != null && park.latitude != null && park.longitude != null
        ? haversineKm(lat, lon, park.latitude, park.longitude)
        : Infinity,
  }));

  scored.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.001) return b.score - a.score;
    return a.distance - b.distance;
  });

  return scored.slice(0, 50).map((s) => s.park);
}
