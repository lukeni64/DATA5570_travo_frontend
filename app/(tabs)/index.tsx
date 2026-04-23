import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { colors } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchFeed } from '@/store/reviewsSlice';
import { TravelPost } from '@/types/models';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const feed = useAppSelector((s) => s.reviews.feed);
  const cities = useAppSelector((s) => s.reviews.cities);
  const fetchFeedStatus = useAppSelector((s) => s.reviews.fetchFeedStatus);
  const fetchFeedError = useAppSelector((s) => s.reviews.fetchFeedError);

  useEffect(() => {
    void dispatch(fetchFeed());
  }, [dispatch]);

  const cityMap = useMemo(
    () => new Map(cities.map((c) => [c.id, c])),
    [cities],
  );

  const posts: TravelPost[] = useMemo(() => {
    return [...feed]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((review) => {
        const city = cityMap.get(review.city);
        return {
          id: review.id,
          user: `user_${review.user}`,
          userProfileImage: `https://i.pravatar.cc/120?u=${review.user}`,
          image:
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
          city: city ? city.city : `City #${review.city}`,
          state: city?.state ?? '',
          description: review.description,
          pros: (review.pros || '').split('\n').map((s) => s.trim()).filter(Boolean),
          cons: (review.cons || '').split('\n').map((s) => s.trim()).filter(Boolean),
          createdAt: review.created_at,
        };
      });
  }, [feed, cityMap]);

  return (
    <View style={styles.container}>
      <Text style={styles.motto}>Sharing Travel Experiences with the World</Text>

      {fetchFeedStatus === 'loading' && posts.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accentBlue} />
        </View>
      ) : fetchFeedError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{fetchFeedError}</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPressAuthor={(post) =>
                router.push({
                  pathname: '/user/[username]',
                  params: { username: post.user, image: post.userProfileImage },
                })
              }
            />
          )}
        />
      )}

      <Pressable
        style={styles.refreshButton}
        onPress={() => void dispatch(fetchFeed())}>
        <Ionicons name="refresh" size={22} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  motto: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 120,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.accentClay,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
