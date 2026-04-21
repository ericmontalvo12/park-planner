import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ChipSelect } from '../../components/ChipSelect';
import { LocationInput } from '../../components/LocationInput';
import Colors from '../../constants/Colors';
import { getPreferences, savePreferences } from '../../services/parkService';
import { type Preferences } from '../../types';

const ACTIVITIES = [
  'Hiking', 'Camping', 'Swimming', 'Fishing', 'Rock Climbing', 'Kayaking',
  'Cycling', 'Wildlife Viewing', 'Bird Watching', 'Photography', 'Stargazing',
  'Backpacking', 'Snowshoeing', 'Cross-Country Skiing', 'Horseback Riding',
  'Snorkeling', 'Surfing', 'Caving', 'Waterfall Chasing', 'Scenic Drives',
  'Picnicking', 'Off-Roading', 'Stand-Up Paddleboarding', 'Sailing',
  'Mountain Biking', 'Hot Springs',
];

const CAMPING_STYLES = [
  'Tent Camping', 'RV/Car Camping', 'Backcountry', 'Glamping', 'Cabin/Yurt',
  'Group Camping', 'Beach Camping', 'Desert Camping', 'Alpine Camping', 'Hammock Camping', 'No Camping',
];

const SCENERY_VIBES = [
  'Mountains', 'Ocean/Coast', 'Desert', 'Forest', 'Lakes/Rivers', 'Canyons',
  'Glaciers', 'Wetlands/Swamps', 'Prairie/Grassland', 'Volcanic', 'Tropical',
  'Tundra', 'Caves', 'Waterfalls', 'Dunes', 'Meadows', 'Cliffs', 'Hot Springs',
];

const BUDGET_OPTIONS: Array<{ label: string; value: Preferences['budget'] }> = [
  { label: 'Free', value: 'free' },
  { label: 'Under $15', value: 'under15' },
  { label: 'Under $30', value: 'under30' },
  { label: 'Any', value: 'any' },
];

const DEFAULT_PREFERENCES: Preferences = {
  activities: [],
  campingStyles: [],
  sceneryVibes: [],
  locationState: null,
  budget: 'any',
  latitude: null,
  longitude: null,
};

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function PlanScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const db = useSQLiteContext();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  // Load persisted preferences
  useEffect(() => {
    getPreferences(db).then((raw) => {
      if (raw) {
        try {
          setPrefs(JSON.parse(raw) as Preferences);
        } catch {
          // ignore
        }
      }
      setLoaded(true);
    });
  }, [db]);

  // Persist preferences whenever they change
  useEffect(() => {
    if (!loaded) return;
    savePreferences(db, JSON.stringify(prefs)).catch(console.warn);
  }, [prefs, loaded, db]);

  const toggleActivity = useCallback((option: string) => {
    setPrefs((p) => ({
      ...p,
      activities: p.activities.includes(option)
        ? p.activities.filter((a) => a !== option)
        : [...p.activities, option],
    }));
  }, []);

  const toggleCamping = useCallback((option: string) => {
    setPrefs((p) => ({
      ...p,
      campingStyles: p.campingStyles.includes(option)
        ? p.campingStyles.filter((a) => a !== option)
        : [...p.campingStyles, option],
    }));
  }, []);

  const toggleScenery = useCallback((option: string) => {
    setPrefs((p) => ({
      ...p,
      sceneryVibes: p.sceneryVibes.includes(option)
        ? p.sceneryVibes.filter((a) => a !== option)
        : [...p.sceneryVibes, option],
    }));
  }, []);

  const handleFindParks = () => {
    router.push({ pathname: '/results', params: { prefs: JSON.stringify(prefs) } });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: colors.text }]}>Plan Your Adventure</Text>
      <Text style={[styles.subheading, { color: colors.subtext }]}>
        Tell us what you love and we'll find your perfect parks.
      </Text>

      <Section title="Activities" colors={colors}>
        <ChipSelect options={ACTIVITIES} selected={prefs.activities} onToggle={toggleActivity} />
      </Section>

      <Section title="Camping Style" colors={colors}>
        <ChipSelect
          options={CAMPING_STYLES}
          selected={prefs.campingStyles}
          onToggle={toggleCamping}
        />
      </Section>

      <Section title="Scenery Vibes" colors={colors}>
        <ChipSelect
          options={SCENERY_VIBES}
          selected={prefs.sceneryVibes}
          onToggle={toggleScenery}
        />
      </Section>

      <Section title="Where do you want to camp?" colors={colors}>
        <LocationInput
          value={{
            state: prefs.locationState,
            latitude: prefs.latitude,
            longitude: prefs.longitude,
          }}
          onChange={({ state, latitude, longitude }) =>
            setPrefs((p) => ({ ...p, locationState: state, latitude, longitude }))
          }
        />
      </Section>

      <Section title="Budget" colors={colors}>
        <View style={styles.budgetRow}>
          {BUDGET_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setPrefs((p) => ({ ...p, budget: opt.value }))}
              style={[
                styles.budgetChip,
                prefs.budget === opt.value
                  ? { backgroundColor: colors.tint, borderColor: colors.tint }
                  : { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.budgetChipText,
                  { color: prefs.budget === opt.value ? '#fff' : colors.text },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Section>

      <TouchableOpacity
        style={[styles.findButton, { backgroundColor: colors.tint }]}
        onPress={handleFindParks}
        activeOpacity={0.85}
      >
        <Text style={styles.findButtonText}>Find Parks</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 2,
  },
  subheading: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  budgetChip: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  budgetChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  findButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  findButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
