import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Stack } from 'expo-router';
import { SQLiteProvider, openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initDatabase } from '../db/migrations';
import { syncNpsParks } from '../services/npsApi';
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

function LoadingScreen({ message }: { message: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.tint} />
      <Text style={[styles.loadingText, { color: colors.subtext }]}>
        {message}
      </Text>
    </View>
  );
}

function AppStack() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <>
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
    </>
  );
}

export default function RootLayout() {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [syncSignal, setSyncSignal] = useState(0);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        setLoadingMessage('Opening database...');
        const database = await openDatabaseAsync('parkplanner.db');
        if (!mounted) return;
        setDb(database);

        setLoadingMessage('Setting up database...');
        await initDatabase(database);

        setLoadingMessage('Loading national parks...');
        try {
          await syncNpsParks(database);
        } catch (e) {
          console.warn('NPS sync failed:', e);
        }

        if (!mounted) return;
        setSyncSignal((s) => s + 1);
        setIsReady(true);
      } catch (error) {
        console.error('Database initialization failed:', error);
        if (mounted) {
          setLoadingMessage('Failed to initialize. Please restart the app.');
        }
      }
    }

    initialize();
    return () => { mounted = false; };
  }, []);

  if (!isReady || !db) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.root, { backgroundColor: colors.background }]}>
          <LoadingScreen message={loadingMessage} />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <SQLiteProvider databaseName="parkplanner.db">
          <SyncSignalContext.Provider value={{ syncSignal }}>
            <AppStack />
          </SyncSignalContext.Provider>
        </SQLiteProvider>

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
