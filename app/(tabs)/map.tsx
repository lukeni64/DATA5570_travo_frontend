import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map coming soon</Text>
      <Text style={styles.subtitle}>This screen is prepared for future Mapbox integration.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
