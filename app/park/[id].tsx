import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Platform,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Image } from 'expo-image';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { getParkById } from '../../services/parkService';
import { type Park } from '../../types';

const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

interface EntranceFee {
  cost: string;
  description: string;
  title: string;
}

function parseEntranceFees(park: Park): EntranceFee[] {
  if (park.source === 'nps') {
    try {
      const raw = JSON.parse(park.rawJson) as { entranceFees?: EntranceFee[] };
      if (raw.entranceFees && raw.entranceFees.length > 0) {
        return raw.entranceFees;
      }
    } catch {
      // fall through
    }
  }
  if (park.entranceFeeCents === 0) {
    return [{ cost: '0.00', description: '', title: 'Free entrance' }];
  }
  return [
    {
      cost: (park.entranceFeeCents / 100).toFixed(2),
      description: '',
      title: 'Entrance fee',
    },
  ];
}

function openInMaps(lat: number, lon: number, name: string) {
  const encoded = encodeURIComponent(name);
  const url = Platform.select({
    ios: `maps://?ll=${lat},${lon}&q=${encoded}`,
    android: `geo:${lat},${lon}?q=${encoded}`,
    default: `https://www.google.com/maps?q=${lat},${lon}+(${encoded})`,
  });
  if (url) {
    Linking.openURL(url).catch(() =>
      Alert.alert('Cannot open Maps', 'Unable to open the Maps app.'),
    );
  }
}

export default function ParkDetailScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [park, setPark] = useState<Park | null>(null);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    if (!id) return;
    getParkById(db, id).then((p) => {
      setPark(p);
      setLoading(false);
    });
  }, [db, id]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (!park) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.subtext }]}>Park not found.</Text>
      </View>
    );
  }

  const fees = parseEntranceFees(park);
  const shortDesc = park.description.slice(0, 280);
  const hasMore = park.description.length > 280;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Image */}
      <Image
        source={{ uri: park.imageUrl ?? undefined }}
        style={styles.heroImage}
        contentFit="cover"
        placeholder={{ blurhash: BLURHASH }}
        transition={400}
      />

      <View style={styles.content}>
        {/* Title + badges */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>{park.fullName}</Text>
        </View>

        <View style={styles.badgeRow}>
          {park.designation ? (
            <View style={[styles.badge, { backgroundColor: colors.tint + '20', borderColor: colors.tint + '50' }]}>
              <Text style={[styles.badgeText, { color: colors.tint }]}>{park.designation}</Text>
            </View>
          ) : null}
          {park.stateCodes ? (
            <View style={[styles.badge, { backgroundColor: colors.border, borderColor: colors.border }]}>
              <Ionicons name="location-outline" size={12} color={colors.subtext} />
              <Text style={[styles.badgeText, { color: colors.subtext }]}>{park.stateCodes}</Text>
            </View>
          ) : null}
        </View>

        {/* Description */}
        {park.description ? (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            <Text style={[styles.description, { color: colors.subtext }]}>
              {descExpanded ? park.description : shortDesc}
              {!descExpanded && hasMore ? '…' : ''}
            </Text>
            {hasMore && (
              <TouchableOpacity onPress={() => setDescExpanded((v) => !v)}>
                <Text style={[styles.showMore, { color: colors.tint }]}>
                  {descExpanded ? 'Show less' : 'Show more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* Entrance Fees */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Entrance Fees</Text>
          {fees.map((fee, i) => (
            <View key={i} style={styles.feeRow}>
              <View style={styles.feeInfo}>
                <Text style={[styles.feeTitle, { color: colors.text }]}>{fee.title}</Text>
                {fee.description ? (
                  <Text style={[styles.feeDesc, { color: colors.subtext }]} numberOfLines={2}>
                    {fee.description}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.feeAmount, { color: colors.tint }]}>
                {parseFloat(fee.cost) === 0 ? 'Free' : `$${parseFloat(fee.cost).toFixed(2)}`}
              </Text>
            </View>
          ))}
        </View>

        {/* Activities */}
        {park.activities.length > 0 && (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Activities</Text>
            <View style={styles.chipsRow}>
              {park.activities.map((activity) => (
                <View
                  key={activity}
                  style={[styles.activityChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Text style={[styles.activityChipText, { color: colors.text }]}>{activity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Map */}
        {park.latitude != null && park.longitude != null ? (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: park.latitude,
                longitude: park.longitude,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker
                coordinate={{ latitude: park.latitude, longitude: park.longitude }}
                title={park.fullName}
              />
            </MapView>

            <TouchableOpacity
              style={[styles.mapsButton, { backgroundColor: colors.tint }]}
              onPress={() => openInMaps(park.latitude!, park.longitude!, park.fullName)}
            >
              <Ionicons name="navigate-outline" size={16} color="#fff" />
              <Text style={styles.mapsButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </ScrollView>
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
  },
  errorText: {
    fontSize: 16,
  },
  heroImage: {
    width: '100%',
    height: 260,
    backgroundColor: '#d1d5db',
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  titleRow: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    borderTopWidth: 1,
    paddingTop: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  showMore: {
    fontSize: 14,
    fontWeight: '500',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  feeInfo: {
    flex: 1,
    gap: 2,
  },
  feeTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  feeDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  feeAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  activityChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  activityChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  mapsButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
