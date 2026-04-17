import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { colors } from '@/constants/theme';
import { mapReviewToTravelPost } from '@/lib/travel';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchReviews } from '@/store/travoSlice';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { reviews, reviewsStatus } = useAppSelector((state) => state.travo);

  const posts = useMemo(
    () =>
      [...reviews]
        .map(mapReviewToTravelPost)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reviews],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Text style={styles.motto}>Sharing travel experiences with the world</Text>
            <Text style={styles.subtleText}>
              {reviewsStatus === 'loading'
                ? 'Refreshing reviews from the backend...'
                : `${posts.length} live reviews loaded from Django.`}
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No reviews yet</Text>
            <Text style={styles.emptyStateText}>
              Once a traveler creates a post, it will show up here automatically.
            </Text>
          </View>
        }
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
        refreshing={reviewsStatus === 'loading'}
        onRefresh={() => {
          void dispatch(fetchReviews());
        }}
      />

      <Pressable style={styles.refreshButton} onPress={() => void dispatch(fetchReviews())}>
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
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  subtleText: {
    color: colors.accentBlue,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 18,
  },
  emptyStateTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyStateText: {
    color: colors.textPrimary,
    lineHeight: 20,
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
