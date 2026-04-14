import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Colors from '../constants/Colors';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Page not found</Text>
        <Link href="/(tabs)/plan" style={[styles.link, { color: colors.tint }]}>
          Go to Plan
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '600' },
  link: { fontSize: 16 },
});
