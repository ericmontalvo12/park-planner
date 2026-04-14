import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/EmptyState';
import Colors from '../../constants/Colors';
import { getAllPlans, deletePlan } from '../../services/parkService';
import { useSyncSignal } from '../../contexts/SyncSignalContext';
import { type Plan } from '../../types';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SavedScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const db = useSQLiteContext();
  const { syncSignal } = useSyncSignal();
  const [plans, setPlans] = useState<Plan[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAllPlans(db).then((data) => {
        if (active) setPlans(data);
      });
      return () => {
        active = false;
      };
    }, [db, syncSignal]),
  );

  const handleDelete = (plan: Plan) => {
    Alert.alert(
      'Delete Plan',
      `Delete "${plan.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePlan(db, plan.id);
            setPlans((prev) => prev.filter((p) => p.id !== plan.id));
          },
        },
      ],
    );
  };

  const handleOpen = (plan: Plan) => {
    router.push({
      pathname: '/results',
      params: { prefs: JSON.stringify(plan.preferences) },
    });
  };

  if (plans.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          emoji="🗺️"
          title="No saved plans yet"
          subtitle="Search for parks on the Plan tab and save your favourites."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={plans}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleOpen(item)}
            onLongPress={() => handleDelete(item)}
            delayLongPress={500}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconWrap, { backgroundColor: colors.tint + '20' }]}>
                <Ionicons name="bookmark" size={20} color={colors.tint} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.planName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.planMeta, { color: colors.subtext }]}>
                  {formatDate(item.createdAt)} · {item.resultIds.length} parks
                </Text>
                <View style={styles.prefsRow}>
                  {item.preferences.activities.slice(0, 3).map((a) => (
                    <View
                      key={a}
                      style={[styles.prefTag, { backgroundColor: colors.border }]}
                    >
                      <Text style={[styles.prefTagText, { color: colors.subtext }]}>{a}</Text>
                    </View>
                  ))}
                  {item.preferences.activities.length > 3 && (
                    <Text style={[styles.prefTagText, { color: colors.subtext }]}>
                      +{item.preferences.activities.length - 3}
                    </Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <Text style={[styles.hint, { color: colors.subtext }]}>
            Long-press a plan to delete it
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 10,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 3,
  },
  planName: {
    fontSize: 15,
    fontWeight: '600',
  },
  planMeta: {
    fontSize: 12,
  },
  prefsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  prefTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  prefTagText: {
    fontSize: 11,
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },
});
