import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { type Park } from '../types';

interface ParkRecommendationCardProps {
  park: Park;
  score: number;
  matchedActivities?: string[];
}

const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

export function ParkRecommendationCard({
  park,
  score,
  matchedActivities = [],
}: ParkRecommendationCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const scorePercent = Math.round(score * 100);
  const badgeColor =
    scorePercent >= 70 ? '#16a34a' : scorePercent >= 40 ? '#F59E0B' : '#6b7280';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/park/${park.id}`)}
    >
      <Image
        source={{ uri: park.imageUrl ?? undefined }}
        style={styles.heroImage}
        contentFit="cover"
        placeholder={{ blurhash: BLURHASH }}
        transition={300}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {park.fullName}
          </Text>
          <View style={[styles.scoreBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.scoreText}>{scorePercent}%</Text>
          </View>
        </View>

        <View style={styles.meta}>
          {park.designation ? (
            <Text style={[styles.designation, { color: colors.tint }]} numberOfLines={1}>
              {park.designation}
            </Text>
          ) : null}
          {park.stateCodes ? (
            <Text style={[styles.stateCode, { color: colors.subtext }]}>
              {park.stateCodes}
            </Text>
          ) : null}
        </View>

        {matchedActivities.length > 0 && (
          <View style={styles.tags}>
            {matchedActivities.slice(0, 4).map((activity) => (
              <View
                key={activity}
                style={[
                  styles.tag,
                  {
                    backgroundColor: colors.tint + '20',
                    borderColor: colors.tint + '50',
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.tint }]}>{activity}</Text>
              </View>
            ))}
            {matchedActivities.length > 4 && (
              <View
                style={[
                  styles.tag,
                  { backgroundColor: colors.border, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.subtext }]}>
                  +{matchedActivities.length - 4}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  heroImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#d1d5db',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 42,
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  designation: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  stateCode: {
    fontSize: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
