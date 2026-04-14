export interface Park {
  id: string;
  source: 'nps' | 'state';
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
  lastSynced: number;
}

export interface Plan {
  id: number;
  name: string;
  preferences: Preferences;
  resultIds: string[];
  createdAt: number;
}

export interface Preferences {
  activities: string[];
  campingStyles: string[];
  sceneryVibes: string[];
  locationState: string | null;
  budget: 'free' | 'under15' | 'under30' | 'any';
  latitude: number | null;
  longitude: number | null;
}
