import { type Park } from '../types';

const NOW = 0;

type SeedPark = Omit<Park, 'lastSynced' | 'rawJson' | 'activities' | 'entranceFeeCents' | 'imageUrl' | 'description'>;

const SEEDS: SeedPark[] = [
  // California
  { id: 'seed_anza_borrego', source: 'state', fullName: 'Anza-Borrego Desert State Park', stateCodes: 'CA', latitude: 33.2578, longitude: -116.3956, designation: 'State Park' },
  { id: 'seed_big_basin', source: 'state', fullName: 'Big Basin Redwoods State Park', stateCodes: 'CA', latitude: 37.1741, longitude: -122.2230, designation: 'State Park' },
  { id: 'seed_humboldt_redwoods', source: 'state', fullName: 'Humboldt Redwoods State Park', stateCodes: 'CA', latitude: 40.3476, longitude: -123.9224, designation: 'State Park' },
  { id: 'seed_pfeiffer', source: 'state', fullName: 'Pfeiffer Big Sur State Park', stateCodes: 'CA', latitude: 36.2404, longitude: -121.7853, designation: 'State Park' },
  { id: 'seed_mt_tam', source: 'state', fullName: 'Mount Tamalpais State Park', stateCodes: 'CA', latitude: 37.9018, longitude: -122.5794, designation: 'State Park' },
  { id: 'seed_crystal_cove', source: 'state', fullName: 'Crystal Cove State Park', stateCodes: 'CA', latitude: 33.5719, longitude: -117.8265, designation: 'State Park' },
  { id: 'seed_samuel_taylor', source: 'state', fullName: 'Samuel P. Taylor State Park', stateCodes: 'CA', latitude: 38.0076, longitude: -122.7301, designation: 'State Park' },
  // Oregon
  { id: 'seed_silver_falls', source: 'state', fullName: 'Silver Falls State Park', stateCodes: 'OR', latitude: 44.8771, longitude: -122.6557, designation: 'State Park' },
  { id: 'seed_smith_rock', source: 'state', fullName: 'Smith Rock State Park', stateCodes: 'OR', latitude: 44.3668, longitude: -121.1430, designation: 'State Park' },
  { id: 'seed_ecola', source: 'state', fullName: 'Ecola State Park', stateCodes: 'OR', latitude: 45.9235, longitude: -123.9790, designation: 'State Park' },
  { id: 'seed_cape_lookout', source: 'state', fullName: 'Cape Lookout State Park', stateCodes: 'OR', latitude: 45.3476, longitude: -123.9699, designation: 'State Park' },
  // Washington
  { id: 'seed_deception_pass', source: 'state', fullName: 'Deception Pass State Park', stateCodes: 'WA', latitude: 48.4057, longitude: -122.6441, designation: 'State Park' },
  { id: 'seed_cape_disappointment', source: 'state', fullName: 'Cape Disappointment State Park', stateCodes: 'WA', latitude: 46.2774, longitude: -124.0563, designation: 'State Park' },
  { id: 'seed_palouse_falls', source: 'state', fullName: 'Palouse Falls State Park', stateCodes: 'WA', latitude: 46.6632, longitude: -118.2263, designation: 'State Park' },
  { id: 'seed_moran', source: 'state', fullName: 'Moran State Park', stateCodes: 'WA', latitude: 48.6516, longitude: -122.8354, designation: 'State Park' },
  // Texas
  { id: 'seed_palo_duro', source: 'state', fullName: 'Palo Duro Canyon State Park', stateCodes: 'TX', latitude: 34.9220, longitude: -101.6715, designation: 'State Park' },
  { id: 'seed_garner', source: 'state', fullName: 'Garner State Park', stateCodes: 'TX', latitude: 29.5924, longitude: -99.7490, designation: 'State Park' },
  { id: 'seed_pedernales', source: 'state', fullName: 'Pedernales Falls State Park', stateCodes: 'TX', latitude: 30.3071, longitude: -98.2561, designation: 'State Park' },
  { id: 'seed_enchanted_rock', source: 'state', fullName: 'Enchanted Rock State Natural Area', stateCodes: 'TX', latitude: 30.5069, longitude: -98.8199, designation: 'State Natural Area' },
  { id: 'seed_bastrop', source: 'state', fullName: 'Bastrop State Park', stateCodes: 'TX', latitude: 30.1093, longitude: -97.2857, designation: 'State Park' },
  { id: 'seed_mckinney_falls', source: 'state', fullName: 'McKinney Falls State Park', stateCodes: 'TX', latitude: 30.1788, longitude: -97.7281, designation: 'State Park' },
  // New York
  { id: 'seed_letchworth', source: 'state', fullName: 'Letchworth State Park', stateCodes: 'NY', latitude: 42.6002, longitude: -78.0506, designation: 'State Park' },
  { id: 'seed_watkins_glen', source: 'state', fullName: 'Watkins Glen State Park', stateCodes: 'NY', latitude: 42.3776, longitude: -76.8771, designation: 'State Park' },
  { id: 'seed_taughannock', source: 'state', fullName: 'Taughannock Falls State Park', stateCodes: 'NY', latitude: 42.5372, longitude: -76.5981, designation: 'State Park' },
  // Pennsylvania
  { id: 'seed_ricketts_glen', source: 'state', fullName: 'Ricketts Glen State Park', stateCodes: 'PA', latitude: 41.3218, longitude: -76.2807, designation: 'State Park' },
  { id: 'seed_ohiopyle', source: 'state', fullName: 'Ohiopyle State Park', stateCodes: 'PA', latitude: 39.8674, longitude: -79.4900, designation: 'State Park' },
  { id: 'seed_presque_isle', source: 'state', fullName: 'Presque Isle State Park', stateCodes: 'PA', latitude: 42.1569, longitude: -80.0956, designation: 'State Park' },
  // Michigan
  { id: 'seed_porcupine', source: 'state', fullName: 'Porcupine Mountains Wilderness State Park', stateCodes: 'MI', latitude: 46.7976, longitude: -89.7443, designation: 'State Park' },
  { id: 'seed_tahquamenon', source: 'state', fullName: 'Tahquamenon Falls State Park', stateCodes: 'MI', latitude: 46.5990, longitude: -85.1602, designation: 'State Park' },
  // Minnesota
  { id: 'seed_gooseberry', source: 'state', fullName: 'Gooseberry Falls State Park', stateCodes: 'MN', latitude: 47.1374, longitude: -91.4704, designation: 'State Park' },
  { id: 'seed_split_rock', source: 'state', fullName: 'Split Rock Lighthouse State Park', stateCodes: 'MN', latitude: 47.2015, longitude: -91.3673, designation: 'State Park' },
  { id: 'seed_itasca', source: 'state', fullName: 'Itasca State Park', stateCodes: 'MN', latitude: 47.2372, longitude: -95.1989, designation: 'State Park' },
  // Georgia
  { id: 'seed_cloudland', source: 'state', fullName: 'Cloudland Canyon State Park', stateCodes: 'GA', latitude: 34.8360, longitude: -85.4830, designation: 'State Park' },
  { id: 'seed_amicalola', source: 'state', fullName: 'Amicalola Falls State Park', stateCodes: 'GA', latitude: 34.5648, longitude: -84.2362, designation: 'State Park' },
  { id: 'seed_providence_canyon', source: 'state', fullName: 'Providence Canyon State Park', stateCodes: 'GA', latitude: 32.0721, longitude: -84.9060, designation: 'State Park' },
  // Tennessee
  { id: 'seed_fall_creek', source: 'state', fullName: 'Fall Creek Falls State Park', stateCodes: 'TN', latitude: 35.6538, longitude: -85.3478, designation: 'State Park' },
  // Kentucky
  { id: 'seed_cumberland_falls', source: 'state', fullName: 'Cumberland Falls State Resort Park', stateCodes: 'KY', latitude: 36.8393, longitude: -84.3427, designation: 'State Park' },
  { id: 'seed_natural_bridge_ky', source: 'state', fullName: 'Natural Bridge State Resort Park', stateCodes: 'KY', latitude: 37.7751, longitude: -83.6809, designation: 'State Park' },
  { id: 'seed_carter_caves', source: 'state', fullName: 'Carter Caves State Resort Park', stateCodes: 'KY', latitude: 38.3717, longitude: -83.1257, designation: 'State Park' },
  // Arizona
  { id: 'seed_kartchner', source: 'state', fullName: 'Kartchner Caverns State Park', stateCodes: 'AZ', latitude: 31.8357, longitude: -110.3470, designation: 'State Park' },
  { id: 'seed_lost_dutchman', source: 'state', fullName: 'Lost Dutchman State Park', stateCodes: 'AZ', latitude: 33.4612, longitude: -111.4804, designation: 'State Park' },
  { id: 'seed_slide_rock', source: 'state', fullName: 'Slide Rock State Park', stateCodes: 'AZ', latitude: 34.9397, longitude: -111.7541, designation: 'State Park' },
  { id: 'seed_dead_horse_az', source: 'state', fullName: 'Dead Horse Ranch State Park', stateCodes: 'AZ', latitude: 34.7387, longitude: -112.0012, designation: 'State Park' },
  // South Dakota
  { id: 'seed_custer', source: 'state', fullName: 'Custer State Park', stateCodes: 'SD', latitude: 43.7225, longitude: -103.5000, designation: 'State Park' },
  // Nevada
  { id: 'seed_valley_of_fire', source: 'state', fullName: 'Valley of Fire State Park', stateCodes: 'NV', latitude: 36.4765, longitude: -114.5333, designation: 'State Park' },
  { id: 'seed_lake_tahoe_nv', source: 'state', fullName: 'Lake Tahoe Nevada State Park', stateCodes: 'NV', latitude: 39.0968, longitude: -119.9369, designation: 'State Park' },
  // Florida
  { id: 'seed_myakka', source: 'state', fullName: 'Myakka River State Park', stateCodes: 'FL', latitude: 27.2327, longitude: -82.3063, designation: 'State Park' },
  { id: 'seed_wakulla', source: 'state', fullName: 'Wakulla Springs State Park', stateCodes: 'FL', latitude: 30.2354, longitude: -84.3004, designation: 'State Park' },
  { id: 'seed_jonathan_dickinson', source: 'state', fullName: 'Jonathan Dickinson State Park', stateCodes: 'FL', latitude: 27.0049, longitude: -80.1070, designation: 'State Park' },
  // Illinois
  { id: 'seed_starved_rock', source: 'state', fullName: 'Starved Rock State Park', stateCodes: 'IL', latitude: 41.3190, longitude: -88.9932, designation: 'State Park' },
  { id: 'seed_matthiessen', source: 'state', fullName: 'Matthiessen State Park', stateCodes: 'IL', latitude: 41.2860, longitude: -89.0426, designation: 'State Park' },
  // Indiana
  { id: 'seed_turkey_run', source: 'state', fullName: 'Turkey Run State Park', stateCodes: 'IN', latitude: 39.8938, longitude: -87.2170, designation: 'State Park' },
  // Ohio
  { id: 'seed_hocking_hills', source: 'state', fullName: 'Hocking Hills State Park', stateCodes: 'OH', latitude: 39.4382, longitude: -82.5287, designation: 'State Park' },
  // Oklahoma
  { id: 'seed_beavers_bend', source: 'state', fullName: 'Beavers Bend State Park', stateCodes: 'OK', latitude: 34.1362, longitude: -94.6972, designation: 'State Park' },
  { id: 'seed_robbers_cave', source: 'state', fullName: 'Robbers Cave State Park', stateCodes: 'OK', latitude: 34.9281, longitude: -95.0786, designation: 'State Park' },
  // North Carolina
  { id: 'seed_hanging_rock', source: 'state', fullName: 'Hanging Rock State Park', stateCodes: 'NC', latitude: 36.3946, longitude: -80.2696, designation: 'State Park' },
  { id: 'seed_crowders', source: 'state', fullName: 'Crowders Mountain State Park', stateCodes: 'NC', latitude: 35.2116, longitude: -81.3004, designation: 'State Park' },
  // South Carolina
  { id: 'seed_caesars_head', source: 'state', fullName: "Caesars Head State Park", stateCodes: 'SC', latitude: 35.1043, longitude: -82.6282, designation: 'State Park' },
  { id: 'seed_table_rock', source: 'state', fullName: 'Table Rock State Park', stateCodes: 'SC', latitude: 35.0285, longitude: -82.6987, designation: 'State Park' },
  // Colorado
  { id: 'seed_roxborough', source: 'state', fullName: 'Roxborough State Park', stateCodes: 'CO', latitude: 39.4264, longitude: -105.0638, designation: 'State Park' },
  { id: 'seed_eldorado_canyon', source: 'state', fullName: 'Eldorado Canyon State Park', stateCodes: 'CO', latitude: 39.9310, longitude: -105.2910, designation: 'State Park' },
  { id: 'seed_mueller', source: 'state', fullName: 'Mueller State Park', stateCodes: 'CO', latitude: 38.8974, longitude: -105.1738, designation: 'State Park' },
  // Utah
  { id: 'seed_goblin_valley', source: 'state', fullName: 'Goblin Valley State Park', stateCodes: 'UT', latitude: 38.5684, longitude: -110.7074, designation: 'State Park' },
  { id: 'seed_dead_horse_ut', source: 'state', fullName: 'Dead Horse Point State Park', stateCodes: 'UT', latitude: 38.4844, longitude: -109.7416, designation: 'State Park' },
  { id: 'seed_snow_canyon', source: 'state', fullName: 'Snow Canyon State Park', stateCodes: 'UT', latitude: 37.1998, longitude: -113.6495, designation: 'State Park' },
  // Idaho
  { id: 'seed_ponderosa', source: 'state', fullName: 'Ponderosa State Park', stateCodes: 'ID', latitude: 44.5596, longitude: -116.1236, designation: 'State Park' },
  // Montana
  { id: 'seed_makoshika', source: 'state', fullName: 'Makoshika State Park', stateCodes: 'MT', latitude: 47.1074, longitude: -104.6993, designation: 'State Park' },
  // Vermont
  { id: 'seed_smugglers_notch', source: 'state', fullName: "Smugglers' Notch State Park", stateCodes: 'VT', latitude: 44.5629, longitude: -72.7988, designation: 'State Park' },
  // Maine
  { id: 'seed_baxter', source: 'state', fullName: 'Baxter State Park', stateCodes: 'ME', latitude: 46.1219, longitude: -68.9254, designation: 'State Park' },
  // New Hampshire
  { id: 'seed_franconia', source: 'state', fullName: 'Franconia Notch State Park', stateCodes: 'NH', latitude: 44.1579, longitude: -71.6800, designation: 'State Park' },
  // Maryland
  { id: 'seed_swallow_falls', source: 'state', fullName: 'Swallow Falls State Park', stateCodes: 'MD', latitude: 39.4898, longitude: -79.4109, designation: 'State Park' },
  // Virginia
  { id: 'seed_first_landing', source: 'state', fullName: 'First Landing State Park', stateCodes: 'VA', latitude: 36.9057, longitude: -76.0085, designation: 'State Park' },
  // Alaska
  { id: 'seed_chugach', source: 'state', fullName: 'Chugach State Park', stateCodes: 'AK', latitude: 61.1670, longitude: -149.3530, designation: 'State Park' },
  // Hawaii
  { id: 'seed_napali', source: 'state', fullName: 'Nāpali Coast State Wilderness Park', stateCodes: 'HI', latitude: 22.1987, longitude: -159.6488, designation: 'State Park' },
  { id: 'seed_waimea_canyon', source: 'state', fullName: 'Waimea Canyon State Park', stateCodes: 'HI', latitude: 22.0549, longitude: -159.6688, designation: 'State Park' },
];

export function toFullPark(s: SeedPark): Park {
  return {
    ...s,
    description: '',
    imageUrl: null,
    activities: [],
    entranceFeeCents: 0,
    rawJson: '{}',
    lastSynced: NOW,
  };
}

export { SEEDS };
