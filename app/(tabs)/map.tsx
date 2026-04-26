import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '@/constants/theme';
import { getCities, listRelationships, listReviews, type ApiCity, type ApiReview } from '@/services/travoApi';

const CURRENT_USERNAME = 'traveler.jules';

type FilterMode = 'all' | 'mine' | 'friends';

const FILTERS: { mode: FilterMode; label: string }[] = [
  { mode: 'all', label: 'All Posts' },
  { mode: 'mine', label: 'My Posts' },
  { mode: 'friends', label: 'Friends' },
];

export default function MapScreen() {
  const [filter, setFilter] = useState<FilterMode>('all');
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [friendUsernames, setFriendUsernames] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedCities, fetchedReviews, relationships] = await Promise.all([
        getCities(),
        listReviews(),
        listRelationships(CURRENT_USERNAME),
      ]);

      setCities(fetchedCities);
      setReviews(fetchedReviews);

      const friendSet = new Set<string>();
      for (const rel of relationships) {
        if (rel.status !== 'accepted') continue;
        const iAmRequester = rel.requester_username === CURRENT_USERNAME;
        const iAmAddressee = rel.addressee_username === CURRENT_USERNAME;
        if (!iAmRequester && !iAmAddressee) continue;
        friendSet.add(iAmRequester ? rel.addressee_username : rel.requester_username);
      }
      setFriendUsernames(friendSet);
    } catch (e) {
      Alert.alert('Failed to load', e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const cityMap = useMemo(() => new Map(cities.map((c) => [c.id, c])), [cities]);

  const filtered = useMemo(() => {
    if (filter === 'mine') return reviews.filter((r) => r.username === CURRENT_USERNAME);
    if (filter === 'friends') return reviews.filter((r) => friendUsernames.has(r.username));
    return reviews;
  }, [filter, reviews, friendUsernames]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Filter toggle */}
      <View style={styles.toggle}>
        {FILTERS.map(({ mode, label }) => (
          <Pressable
            key={mode}
            style={[styles.toggleBtn, filter === mode && styles.toggleBtnActive]}
            onPress={() => setFilter(mode)}
          >
            <Text style={[styles.toggleText, filter === mode && styles.toggleTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.textPrimary} />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : (
        <>
          <Text style={styles.count}>
            {filtered.length} post{filtered.length !== 1 ? 's' : ''}
          </Text>
          {filtered.map((review) => {
            const city = cityMap.get(review.city);
            return (
              <View key={review.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cityName}>
                    {city ? `${city.city}, ${city.state}` : `City #${review.city}`}
                  </Text>
                  <Text style={styles.rating}>★ {review.rating}</Text>
                </View>
                <Text style={styles.author}>@{review.username}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {review.description}
                </Text>
              </View>
            );
          })}
          {filtered.length === 0 && (
            <Text style={styles.empty}>No posts to show for this filter.</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 120 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,30,82,0.85)',
    borderRadius: 10,
    padding: 4,
    gap: 4,
    marginBottom: 16,
    alignSelf: 'center',
  },
  toggleBtn: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 7,
  },
  toggleBtnActive: {
    backgroundColor: '#216e82',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    fontSize: 13,
  },
  toggleTextActive: {
    color: '#fff',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  loadingText: { color: colors.textPrimary },
  count: {
    color: colors.textPrimary,
    opacity: 0.6,
    fontSize: 12,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cityName: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
  },
  rating: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  author: {
    color: colors.textPrimary,
    opacity: 0.55,
    fontSize: 12,
    marginBottom: 6,
  },
  description: {
    color: colors.textPrimary,
    fontSize: 13,
    opacity: 0.85,
  },
  empty: {
    color: colors.textPrimary,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
});
