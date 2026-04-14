import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useColorScheme,
  SafeAreaView,
  TextInput,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { US_STATES } from '../constants/States';

interface LocationValue {
  state: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface LocationInputProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [detecting, setDetecting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filteredStates = US_STATES.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.abbr.toLowerCase().includes(search.toLowerCase()),
  );

  const detectLocation = async () => {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission denied',
          'Location permission is required to detect your location.',
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      onChange({
        state: null,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch {
      Alert.alert('Error', 'Unable to detect location. Please select a state manually.');
    } finally {
      setDetecting(false);
    }
  };

  const selectState = (abbr: string) => {
    const state = US_STATES.find((s) => s.abbr === abbr);
    if (state) {
      onChange({ state: abbr, latitude: state.lat, longitude: state.lon });
    }
    setModalVisible(false);
    setSearch('');
  };

  const clearLocation = () => {
    onChange({ state: null, latitude: null, longitude: null });
  };

  const stateName = value.state
    ? US_STATES.find((s) => s.abbr === value.state)?.name
    : null;

  const hasLocation = value.latitude != null || value.state != null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.gpsButton,
            { backgroundColor: colors.tint, opacity: detecting ? 0.7 : 1 },
          ]}
          onPress={detectLocation}
          disabled={detecting}
        >
          {detecting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="location" size={16} color="#fff" />
          )}
          <Text style={styles.gpsButtonText}>
            {detecting ? 'Detecting…' : 'Use GPS'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.stateButton,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="map-outline" size={16} color={colors.subtext} />
          <Text style={[styles.stateButtonText, { color: colors.text }]}>
            {value.state ?? 'Select State'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.subtext} />
        </TouchableOpacity>
      </View>

      {hasLocation && (
        <View style={styles.locationDisplay}>
          <Ionicons name="checkmark-circle" size={14} color={colors.tint} />
          <Text style={[styles.locationText, { color: colors.subtext }]}>
            {stateName
              ? `${stateName} selected`
              : value.latitude != null
              ? `GPS: ${value.latitude.toFixed(3)}, ${value.longitude?.toFixed(3)}`
              : ''}
          </Text>
          <TouchableOpacity onPress={clearLocation}>
            <Ionicons name="close-circle" size={14} color={colors.subtext} />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView
          style={[styles.modal, { backgroundColor: colors.background }]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select State</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
            <Ionicons name="search" size={16} color={colors.subtext} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search states…"
              placeholderTextColor={colors.subtext}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredStates}
            keyExtractor={(item) => item.abbr}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.stateItem,
                  { borderBottomColor: colors.border },
                  value.state === item.abbr && { backgroundColor: colors.tint + '15' },
                ]}
                onPress={() => selectState(item.abbr)}
              >
                <Text style={[styles.stateItemName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.stateItemAbbr, { color: colors.subtext }]}>
                  {item.abbr}
                </Text>
                {value.state === item.abbr && (
                  <Ionicons name="checkmark" size={16} color={colors.tint} />
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  gpsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  stateButtonText: {
    flex: 1,
    fontSize: 14,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stateItemName: {
    flex: 1,
    fontSize: 15,
  },
  stateItemAbbr: {
    fontSize: 14,
    marginRight: 8,
  },
});
