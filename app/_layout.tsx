import React, { useState, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initDatabase } from '../db/migrations';
import { syncNpsParks } from '../services/npsApi';
import { syncStateParksFromWikidata } from '../services/wikidataApi';
import { SyncSignalContext } from '../contexts/SyncSignalContext';
import Colors from '../constants/Colors';

function SyncBanner({ message }: { message: string }) {
  return (
    <View style={styles.syncBanner}>
      <ActivityIndicator size="small" color="#fff" />
      <Text style={styles.syncText}>{message}</Text>
    </View>
  );
}

function DbLoadingFallback() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.tint} />
      <Text style={[styles.loadingText, { color: colors.subtext }]}>
        Initialising database…
      </Text>
    </View>
  );
}

function AppNavigator({
  setSyncSignal,
  setSyncMessage,
}: {
  setSyncSignal: React.Dispatch<React.SetStateAction<number>>;
  setSyncMessage: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <SQLiteProvider
      databaseName="parkplanner.db"
      onInit={async (db) => {
        await initDatabase(db);
        try {
          await syncNpsParks(db);
        } catch (e) {
          console.warn('NPS sync failed:', e);
        }
        setSyncSignal((s) => s + 1);
        try {
          await syncStateParksFromWikidata(db, (msg) => setSyncMessage(msg));
        } catch (e) {
          console.warn('State parks sync failed:', e);
        } finally {
          setSyncMessage(null);
          setSyncSignal((s) => s + 1);
        }
      }}
    >
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="results"
          options={{ title: 'Recommended Parks', headerBackTitle: 'Plan' }}
        />
        <Stack.Screen
          name="park/[id]"
          options={{ title: 'Park Details', headerBackTitle: 'Back' }}
        />
      </Stack>
    </SQLiteProvider>
  );
}

export default function RootLayout() {
  const [syncSignal, setSyncSignal] = useState(0);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <SyncSignalContext.Provider value={{ syncSignal }}>
          <Suspense fallback={<DbLoadingFallback />}>
            <AppNavigator
              setSyncSignal={setSyncSignal}
              setSyncMessage={setSyncMessage}
            />
          </Suspense>
        </SyncSignalContext.Provider>

        {syncMessage ? <SyncBanner message={syncMessage} /> : null}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  syncBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2D7D46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  syncText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
});
