import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DropdownSelector } from '@/components/DropdownSelector';
import { InputField } from '@/components/InputField';
import { PostCard } from '@/components/PostCard';
import { colors } from '@/constants/theme';
import { buildAvatarUrl, mapReviewToTravelPost } from '@/lib/travel';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createUser, setActiveUserId } from '@/store/travoSlice';

export default function AccountScreen() {
  const dispatch = useAppDispatch();
  const { activeUserId, createUserStatus, error, reviews, users } = useAppSelector(
    (state) => state.travo,
  );
  const activeUser = users.find((user) => user.user_key === activeUserId);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const userPosts = useMemo(
    () =>
      reviews
        .filter((review) => review.user === activeUserId)
        .map(mapReviewToTravelPost)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [activeUserId, reviews],
  );

  const createProfile = async () => {
    try {
      await dispatch(
        createUser({
          username: username.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim(),
        }),
      ).unwrap();

      setUsername('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
    } catch {
      // Errors are surfaced from Redux state.
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {activeUser ? (
        <Pressable style={styles.imageWrap}>
          <Image source={{ uri: buildAvatarUrl(activeUser.username) }} style={styles.image} />
        </Pressable>
      ) : null}

      {users.length > 0 ? (
        <DropdownSelector
          label="Active backend profile"
          value={activeUser?.username}
          options={users.map((user) => user.username)}
          placeholder="Choose a profile"
          onSelect={(selectedUsername) => {
            const selectedUser = users.find((user) => user.username === selectedUsername);
            dispatch(setActiveUserId(selectedUser?.user_key));
          }}
        />
      ) : null}

      {activeUser ? (
        <View style={styles.profileCard}>
          <InputField label="Username" value={activeUser.username} editable={false} />
          <InputField
            label="Name"
            value={`${activeUser.first_name} ${activeUser.last_name}`.trim()}
            editable={false}
          />
          <InputField label="Email" value={activeUser.email} editable={false} />
          <InputField label="Phone" value={activeUser.phone_number || 'Not set'} editable={false} />
          <Text style={styles.helperText}>
            This screen is using a selectable backend profile until auth is added in the next step.
          </Text>
        </View>
      ) : null}

      <View style={styles.profileCard}>
        <Text style={styles.sectionTitle}>
          {users.length > 0 ? 'Add another backend profile' : 'Create your first backend profile'}
        </Text>
        <Text style={styles.helperText}>
          The app needs backend users so reviews and relationships have an owner.
        </Text>
        <InputField label="Username" value={username} onChangeText={setUsername} placeholder="traveler.jules" />
        <InputField label="First name" value={firstName} onChangeText={setFirstName} placeholder="Jules" />
        <InputField label="Last name" value={lastName} onChangeText={setLastName} placeholder="Rivera" />
        <InputField label="Email" value={email} onChangeText={setEmail} placeholder="jules@example.com" />
        <InputField label="Phone number" value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Optional" />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Pressable style={styles.primaryButton} onPress={() => void createProfile()}>
          <Text style={styles.primaryText}>
            {createUserStatus === 'loading' ? 'Creating...' : 'Create Profile'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>My Posts</Text>
      {userPosts.length > 0 ? (
        userPosts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No reviews yet for this profile.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    alignItems: 'stretch',
    paddingBottom: 110,
  },
  imageWrap: {
    width: 108,
    height: 108,
    alignSelf: 'center',
    marginBottom: 18,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 54,
    borderWidth: 2,
    borderColor: colors.accentBlue,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  primaryButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryText: { color: colors.white, fontWeight: '700' },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 10,
  },
  helperText: {
    color: colors.textPrimary,
    lineHeight: 20,
  },
  errorText: {
    color: colors.accentClay,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  emptyStateText: {
    color: colors.textPrimary,
  },
});
