import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { colors } from '@/constants/theme';
import { buildAvatarUrl, mapReviewToTravelPost } from '@/lib/travel';
import { useAppSelector } from '@/store/hooks';

export default function PublicUserProfileScreen() {
  const params = useLocalSearchParams<{ username?: string; image?: string }>();
  const username = params.username ?? 'traveler';
  const { reviews, users } = useAppSelector((state) => state.travo);

  const user = users.find((profile) => profile.username === username);
  const userPosts = reviews
    .filter((review) => review.user_username === username)
    .map(mapReviewToTravelPost);
  const profileImage = params.image ?? buildAvatarUrl(username);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: profileImage }} style={styles.avatar} />
      <Text style={styles.username}>@{username}</Text>
      <Text style={styles.subtitle}>
        {user ? `${user.first_name} ${user.last_name}`.trim() : 'Traveler profile'}
      </Text>
      <Text style={styles.helperText}>{userPosts.length} review(s) published through the backend.</Text>

      <View style={styles.postsWrap}>
        {userPosts.length > 0 ? (
          userPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No public reviews for this traveler yet.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 120,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: colors.accentBlue,
  },
  username: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textPrimary,
    marginTop: 4,
    fontWeight: '600',
  },
  helperText: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  postsWrap: {
    width: '100%',
    marginTop: 20,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 18,
  },
  emptyStateText: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
