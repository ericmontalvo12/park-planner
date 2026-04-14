import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { ParkRecommendationCard } from '../components/ParkRecommendationCard';
import { EmptyState } from '../components/EmptyState';
import Colors from '../constants/Colors';
import { getAllParks, savePlan } from '../services/parkService';
import { rankParks, scorePark, getMatchedActivities } from '../services/scoring';
import { useSyncSignal } from '../contexts/SyncSignalContext';
import { type Park, type Preferences } from '../types';

const DEFAULT_PREFS: Preferences = {
  activities: [],
  campingStyles: [],
  sceneryVibes: [],
  locationState: null,
  budget: 'any',
  latitude: null,
  longitude: null,
};

interface ScoredPark {
  park: Park;
  score: number;
  matchedActivities: string[];
}

export default function ResultsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ prefs: string }>();
  const { syncSignal } = useSyncSignal();

  const preferences = useMemo<Preferences>(() => {
    try {
      return JSON.parse(params.prefs ?? '{}') as Preferences;
    } catch {
      return DEFAULT_PREFS;
    }
  }, [params.prefs]);

  const [results, setResults] = useState<ScoredPark[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [planName, setPlanName] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);

      getAllParks(db).then((parks) => {
        if (!active) return;
        const lat = preferences.latitude ?? undefined;
        const lon = preferences.longitude ?? undefined;
        const ranked = rankParks(parks, preferences, lat, lon);
        const scored: ScoredPark[] = ranked.map((park) => ({
          park,
          score: scorePark(park, preferences),
          matchedActivities: getMatchedActivities(park, preferences),
        }));
        setResults(scored);
        setLoading(false);
      });

      return () => {
        active = false;
      };
    }, [db, preferences, syncSignal]),
  );

  const handleSavePlan = async () => {
    const name = planName.trim();
    if (!name) {
      Alert.alert('Name required', 'Please enter a name for this plan.');
      return;
    }
    setSaving(true);
    try {
      const resultIds = results.map((r) => r.park.id);
      await savePlan(db, name, JSON.stringify(preferences), resultIds);
      setSaveModalVisible(false);
      setPlanName('');
      Alert.alert('Saved!', `"${name}" has been saved to your plans.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to save plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.subtext }]}>
          Ranking parks…
        </Text>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          emoji="🔍"
          title="No parks found"
          subtitle="Try adjusting your preferences or changing your budget filter."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.park.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ParkRecommendationCard
            park={item.park}
            score={item.score}
            matchedActivities={item.matchedActivities}
          />
        )}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={[styles.resultCount, { color: colors.subtext }]}>
              {results.length} parks found
            </Text>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.tint }]}
              onPress={() => setSaveModalVisible(true)}
            >
              <Ionicons name="bookmark-outline" size={16} color="#fff" />
              <Text style={styles.saveButtonText}>Save Plan</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal
        visible={saveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Save Plan</Text>
            <Text style={[styles.modalSubtitle, { color: colors.subtext }]}>
              Name this plan so you can find it later.
            </Text>
            <TextInput
              style={[
                styles.nameInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. Summer Road Trip"
              placeholderTextColor={colors.subtext}
              value={planName}
              onChangeText={setPlanName}
              autoFocus
              maxLength={60}
              returnKeyType="done"
              onSubmitEditing={handleSavePlan}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={() => { setSaveModalVisible(false); setPlanName(''); }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.tint }]}
                onPress={handleSavePlan}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultCount: {
    fontSize: 13,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
