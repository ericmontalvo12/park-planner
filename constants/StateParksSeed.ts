import { type Park } from '../types';

const NOW = 0;
type SeedPark = Omit<Park, 'lastSynced' | 'rawJson' | 'activities' | 'entranceFeeCents' | 'imageUrl' | 'description'>;

const SEEDS: SeedPark[] = [];

export function toFullPark(s: SeedPark): Park {
  return { ...s, description: '', imageUrl: null, activities: [], entranceFeeCents: 0, rawJson: '{}', lastSynced: NOW };
}

export { SEEDS };
