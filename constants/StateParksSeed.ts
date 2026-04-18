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

  // ── Alaska ───────────────────────────────────────────────────────────────
  { id: 'seed_ak_chugach', source: 'state', fullName: 'Chugach State Park', stateCodes: 'AK', latitude: 61.1670, longitude: -149.3530, designation: 'State Park' },
  { id: 'seed_ak_denali', source: 'state', fullName: 'Denali State Park', stateCodes: 'AK', latitude: 62.5357, longitude: -150.1476, designation: 'State Park' },
  { id: 'seed_ak_wood_tikchik', source: 'state', fullName: 'Wood-Tikchik State Park', stateCodes: 'AK', latitude: 59.6972, longitude: -158.6528, designation: 'State Park' },
  { id: 'seed_ak_kachemak_bay', source: 'state', fullName: 'Kachemak Bay State Park', stateCodes: 'AK', latitude: 59.5975, longitude: -151.2125, designation: 'State Park' },
  { id: 'seed_ak_lake_aleknagik', source: 'state', fullName: 'Lake Aleknagik State Recreation Area', stateCodes: 'AK', latitude: 59.2833, longitude: -158.6167, designation: 'State Recreation Area' },
  { id: 'seed_ak_nancy_lake', source: 'state', fullName: 'Nancy Lake State Recreation Area', stateCodes: 'AK', latitude: 61.6803, longitude: -150.0508, designation: 'State Recreation Area' },
  { id: 'seed_ak_chena_river', source: 'state', fullName: 'Chena River State Recreation Area', stateCodes: 'AK', latitude: 64.7500, longitude: -146.5000, designation: 'State Recreation Area' },
  { id: 'seed_ak_delta', source: 'state', fullName: 'Delta State Recreation Site', stateCodes: 'AK', latitude: 64.0380, longitude: -145.7276, designation: 'State Recreation Area' },
  { id: 'seed_ak_eklutna_lake', source: 'state', fullName: 'Eklutna Lake State Recreation Area', stateCodes: 'AK', latitude: 61.4494, longitude: -149.1550, designation: 'State Recreation Area' },
  { id: 'seed_ak_finger_lake', source: 'state', fullName: 'Finger Lake State Recreation Area', stateCodes: 'AK', latitude: 61.6167, longitude: -149.4833, designation: 'State Recreation Area' },
  { id: 'seed_ak_keystone_canyon', source: 'state', fullName: 'Keystone Canyon State Recreation Site', stateCodes: 'AK', latitude: 61.3700, longitude: -145.7200, designation: 'State Recreation Area' },
  { id: 'seed_ak_halibut_point', source: 'state', fullName: 'Halibut Point State Recreation Site', stateCodes: 'AK', latitude: 57.0736, longitude: -135.3697, designation: 'State Recreation Area' },
  { id: 'seed_ak_williwaw', source: 'state', fullName: 'Williwaw State Recreation Site', stateCodes: 'AK', latitude: 60.8167, longitude: -148.9167, designation: 'State Recreation Area' },
  { id: 'seed_ak_totem_bight', source: 'state', fullName: 'Totem Bight State Historical Park', stateCodes: 'AK', latitude: 55.4192, longitude: -131.7384, designation: 'State Historic Park' },
  { id: 'seed_ak_independence_mine', source: 'state', fullName: 'Independence Mine State Historical Park', stateCodes: 'AK', latitude: 61.7714, longitude: -149.2983, designation: 'State Historic Park' },
  { id: 'seed_ak_big_delta', source: 'state', fullName: 'Big Delta State Historical Park', stateCodes: 'AK', latitude: 64.1533, longitude: -145.8367, designation: 'State Historic Park' },
  { id: 'seed_ak_shoup_bay', source: 'state', fullName: 'Shoup Bay State Marine Park', stateCodes: 'AK', latitude: 61.1200, longitude: -146.5500, designation: 'State Marine Park' },
  { id: 'seed_ak_surprise_cove', source: 'state', fullName: 'Surprise Cove State Marine Park', stateCodes: 'AK', latitude: 60.9167, longitude: -148.1667, designation: 'State Marine Park' },
  { id: 'seed_ak_decision_point', source: 'state', fullName: 'Decision Point State Marine Park', stateCodes: 'AK', latitude: 60.9833, longitude: -148.3000, designation: 'State Marine Park' },
  { id: 'seed_ak_halibut_cove', source: 'state', fullName: 'Halibut Cove State Marine Park', stateCodes: 'AK', latitude: 59.5950, longitude: -151.2167, designation: 'State Marine Park' },

  // ── Arizona ──────────────────────────────────────────────────────────────
  { id: 'seed_az_alamo_lake', source: 'state', fullName: 'Alamo Lake State Park', stateCodes: 'AZ', latitude: 34.2361, longitude: -113.5694, designation: 'State Park' },
  { id: 'seed_az_buckskin_mountain', source: 'state', fullName: 'Buckskin Mountain State Park', stateCodes: 'AZ', latitude: 34.1806, longitude: -114.1319, designation: 'State Park' },
  { id: 'seed_az_catalina', source: 'state', fullName: 'Catalina State Park', stateCodes: 'AZ', latitude: 32.4186, longitude: -110.9230, designation: 'State Park' },
  { id: 'seed_az_cattail_cove', source: 'state', fullName: 'Cattail Cove State Park', stateCodes: 'AZ', latitude: 34.3972, longitude: -114.1833, designation: 'State Park' },
  { id: 'seed_az_dead_horse_ranch', source: 'state', fullName: 'Dead Horse Ranch State Park', stateCodes: 'AZ', latitude: 34.7387, longitude: -112.0012, designation: 'State Park' },
  { id: 'seed_az_fool_hollow', source: 'state', fullName: 'Fool Hollow Lake Recreation Area', stateCodes: 'AZ', latitude: 34.1631, longitude: -110.0156, designation: 'State Recreation Area' },
  { id: 'seed_az_lake_havasu', source: 'state', fullName: 'Lake Havasu State Park', stateCodes: 'AZ', latitude: 34.5200, longitude: -114.3500, designation: 'State Park' },
  { id: 'seed_az_lyman_lake', source: 'state', fullName: 'Lyman Lake State Park', stateCodes: 'AZ', latitude: 34.3708, longitude: -109.3722, designation: 'State Park' },
  { id: 'seed_az_patagonia_lake', source: 'state', fullName: 'Patagonia Lake State Park', stateCodes: 'AZ', latitude: 31.4667, longitude: -110.8500, designation: 'State Park' },
  { id: 'seed_az_picacho_peak', source: 'state', fullName: 'Picacho Peak State Park', stateCodes: 'AZ', latitude: 32.6431, longitude: -111.4025, designation: 'State Park' },
  { id: 'seed_az_red_rock', source: 'state', fullName: 'Red Rock State Park', stateCodes: 'AZ', latitude: 34.8667, longitude: -111.8333, designation: 'State Park' },
  { id: 'seed_az_roper_lake', source: 'state', fullName: 'Roper Lake State Park', stateCodes: 'AZ', latitude: 32.7167, longitude: -109.7500, designation: 'State Park' },
  { id: 'seed_az_slide_rock', source: 'state', fullName: 'Slide Rock State Park', stateCodes: 'AZ', latitude: 34.9397, longitude: -111.7541, designation: 'State Park' },
  { id: 'seed_az_tonto_natural_bridge', source: 'state', fullName: 'Tonto Natural Bridge State Park', stateCodes: 'AZ', latitude: 34.3253, longitude: -111.4514, designation: 'State Park' },
  { id: 'seed_az_burro_creek', source: 'state', fullName: 'Burro Creek State Park', stateCodes: 'AZ', latitude: 34.4667, longitude: -113.6500, designation: 'State Park' },
  { id: 'seed_az_fort_verde', source: 'state', fullName: 'Fort Verde State Historic Park', stateCodes: 'AZ', latitude: 34.5597, longitude: -111.8603, designation: 'State Historic Park' },
  { id: 'seed_az_jerome', source: 'state', fullName: 'Jerome State Historic Park', stateCodes: 'AZ', latitude: 34.7481, longitude: -112.1144, designation: 'State Historic Park' },
  { id: 'seed_az_mcfarland', source: 'state', fullName: 'McFarland State Historic Park', stateCodes: 'AZ', latitude: 33.0314, longitude: -111.3875, designation: 'State Historic Park' },
  { id: 'seed_az_tubac_presidio', source: 'state', fullName: 'Tubac Presidio State Historic Park', stateCodes: 'AZ', latitude: 31.5667, longitude: -111.0500, designation: 'State Historic Park' },
  { id: 'seed_az_tombstone_courthouse', source: 'state', fullName: 'Tombstone Courthouse State Historic Park', stateCodes: 'AZ', latitude: 31.7128, longitude: -110.0669, designation: 'State Historic Park' },
  { id: 'seed_az_yuma_prison', source: 'state', fullName: 'Yuma Territorial Prison State Historic Park', stateCodes: 'AZ', latitude: 32.7236, longitude: -114.6222, designation: 'State Historic Park' },
  { id: 'seed_az_riordan_mansion', source: 'state', fullName: 'Riordan Mansion State Historic Park', stateCodes: 'AZ', latitude: 35.1939, longitude: -111.6481, designation: 'State Historic Park' },
  { id: 'seed_az_homolovi', source: 'state', fullName: 'Homolovi State Park', stateCodes: 'AZ', latitude: 35.0378, longitude: -110.6469, designation: 'State Historic Park' },
  { id: 'seed_az_colorado_river', source: 'state', fullName: 'Colorado River State Historic Park', stateCodes: 'AZ', latitude: 32.7167, longitude: -114.6333, designation: 'State Historic Park' },
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
