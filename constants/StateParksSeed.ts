import { type Park } from '../types';

const NOW = 0;

type SeedPark = Omit<Park, 'lastSynced' | 'rawJson' | 'activities' | 'entranceFeeCents' | 'imageUrl' | 'description'>;

const SEEDS: SeedPark[] = [
  // ── Alabama ──────────────────────────────────────────────────────────────
  { id: 'seed_al_blue_springs', source: 'state', fullName: 'Blue Springs State Park', stateCodes: 'AL', latitude: 31.7138, longitude: -85.5971, designation: 'State Park' },
  { id: 'seed_al_bucks_pocket', source: 'state', fullName: "Buck's Pocket State Park", stateCodes: 'AL', latitude: 34.3743, longitude: -86.0588, designation: 'State Park' },
  { id: 'seed_al_cathedral_caverns', source: 'state', fullName: 'Cathedral Caverns State Park', stateCodes: 'AL', latitude: 34.5954, longitude: -86.2116, designation: 'State Park' },
  { id: 'seed_al_cheaha', source: 'state', fullName: 'Cheaha State Park', stateCodes: 'AL', latitude: 33.4854, longitude: -85.8093, designation: 'State Park' },
  { id: 'seed_al_chewacla', source: 'state', fullName: 'Chewacla State Park', stateCodes: 'AL', latitude: 32.5385, longitude: -85.4755, designation: 'State Park' },
  { id: 'seed_al_desoto', source: 'state', fullName: 'DeSoto State Park', stateCodes: 'AL', latitude: 34.4968, longitude: -85.6208, designation: 'State Park' },
  { id: 'seed_al_frank_jackson', source: 'state', fullName: 'Frank Jackson State Park', stateCodes: 'AL', latitude: 31.2785, longitude: -86.2763, designation: 'State Park' },
  { id: 'seed_al_gulf', source: 'state', fullName: 'Gulf State Park', stateCodes: 'AL', latitude: 30.2627, longitude: -87.6694, designation: 'State Park' },
  { id: 'seed_al_joe_wheeler', source: 'state', fullName: 'Joe Wheeler State Park', stateCodes: 'AL', latitude: 34.8279, longitude: -87.3222, designation: 'State Park' },
  { id: 'seed_al_lake_guntersville', source: 'state', fullName: 'Lake Guntersville State Park', stateCodes: 'AL', latitude: 34.3787, longitude: -86.2088, designation: 'State Park' },
  { id: 'seed_al_lake_lurleen', source: 'state', fullName: 'Lake Lurleen State Park', stateCodes: 'AL', latitude: 33.2660, longitude: -87.5671, designation: 'State Park' },
  { id: 'seed_al_lakepoint', source: 'state', fullName: 'Lakepoint Resort State Park', stateCodes: 'AL', latitude: 31.9835, longitude: -85.0809, designation: 'State Park' },
  { id: 'seed_al_meaher', source: 'state', fullName: 'Meaher State Park', stateCodes: 'AL', latitude: 30.6696, longitude: -87.9120, designation: 'State Park' },
  { id: 'seed_al_monte_sano', source: 'state', fullName: 'Monte Sano State Park', stateCodes: 'AL', latitude: 34.7527, longitude: -86.5052, designation: 'State Park' },
  { id: 'seed_al_oak_mountain', source: 'state', fullName: 'Oak Mountain State Park', stateCodes: 'AL', latitude: 33.3593, longitude: -86.7116, designation: 'State Park' },
  { id: 'seed_al_rickwood_caverns', source: 'state', fullName: 'Rickwood Caverns State Park', stateCodes: 'AL', latitude: 33.8321, longitude: -86.8254, designation: 'State Park' },
  { id: 'seed_al_roland_cooper', source: 'state', fullName: 'Roland Cooper State Park', stateCodes: 'AL', latitude: 31.9474, longitude: -87.2669, designation: 'State Park' },
  { id: 'seed_al_wind_creek', source: 'state', fullName: 'Wind Creek State Park', stateCodes: 'AL', latitude: 32.8871, longitude: -85.9385, designation: 'State Park' },
  { id: 'seed_al_bladon_springs', source: 'state', fullName: 'Bladon Springs State Park', stateCodes: 'AL', latitude: 31.7652, longitude: -88.0879, designation: 'State Park' },
  { id: 'seed_al_chickasaw', source: 'state', fullName: 'Chickasaw State Park', stateCodes: 'AL', latitude: 32.2543, longitude: -87.8027, designation: 'State Park' },
  { id: 'seed_al_paul_grist', source: 'state', fullName: 'Paul M. Grist State Park', stateCodes: 'AL', latitude: 32.4271, longitude: -87.0835, designation: 'State Park' },
  { id: 'seed_al_blakeley', source: 'state', fullName: 'Historic Blakeley State Park', stateCodes: 'AL', latitude: 30.7257, longitude: -87.8671, designation: 'State Historic Park' },
  { id: 'seed_al_brierfield', source: 'state', fullName: 'Brierfield Ironworks Historical State Park', stateCodes: 'AL', latitude: 33.0437, longitude: -86.9376, designation: 'State Historic Park' },
  { id: 'seed_al_tannehill', source: 'state', fullName: 'Tannehill Ironworks Historical State Park', stateCodes: 'AL', latitude: 33.3616, longitude: -87.0785, designation: 'State Historic Park' },
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
