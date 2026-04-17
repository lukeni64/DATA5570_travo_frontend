import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DropdownSelector } from '@/components/DropdownSelector';
import { InputField } from '@/components/InputField';
import { colors } from '@/constants/theme';
import { buildAvatarUrl } from '@/lib/travel';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createRelationship, deleteRelationship, setActiveUserId } from '@/store/travoSlice';

export default function FriendsScreen() {
  const dispatch = useAppDispatch();
  const { activeUserId, error, relationshipMutationStatus, relationships, users } = useAppSelector(
    (state) => state.travo,
  );
  const [search, setSearch] = useState('');

  const activeUser = users.find((user) => user.user_key === activeUserId);
  const userOptions = users.map((user) => user.username);
  const userById = useMemo(
    () => new Map(users.map((user) => [user.user_key, user] as const)),
    [users],
  );

  const relatedRelationships = useMemo(
    () =>
      relationships.filter(
        (relationship) =>
          relationship.requester === activeUserId || relationship.addressee === activeUserId,
      ),
    [activeUserId, relationships],
  );

  const pendingRequests = useMemo(
    () =>
      relatedRelationships
        .filter((relationship) => relationship.status === 'pending' && relationship.addressee === activeUserId)
        .map((relationship) => userById.get(relationship.requester))
        .filter((user): user is NonNullable<typeof user> => Boolean(user)),
    [activeUserId, relatedRelationships, userById],
  );

  const friendConnections = useMemo(
    () =>
      relatedRelationships
        .filter((relationship) => relationship.status === 'accepted')
        .map((relationship) => ({
          relationshipId: relationship.id,
          user:
            relationship.requester === activeUserId
              ? userById.get(relationship.addressee)
              : userById.get(relationship.requester),
        }))
        .filter(
          (item): item is { relationshipId: number; user: NonNullable<(typeof item)['user']> } =>
            Boolean(item.user),
        ),
    [activeUserId, relatedRelationships, userById],
  );

  const blockedIds = useMemo(() => {
    const ids = new Set<number>();
    relatedRelationships.forEach((relationship) => {
      ids.add(relationship.requester === activeUserId ? relationship.addressee : relationship.requester);
    });
    return ids;
  }, [activeUserId, relatedRelationships]);

  const suggestions = useMemo(
    () =>
      users.filter(
        (user) =>
          user.user_key !== activeUserId &&
          !blockedIds.has(user.user_key) &&
          user.username.toLowerCase().includes(search.toLowerCase()),
      ),
    [activeUserId, blockedIds, search, users],
  );

  const onSendRequest = async (addresseeId: number) => {
    if (!activeUserId) return;
    await dispatch(
      createRelationship({
        requester: activeUserId,
        addressee: addresseeId,
        status: 'pending',
      }),
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {users.length > 0 ? (
        <DropdownSelector
          label="Active traveler"
          value={activeUser?.username}
          options={userOptions}
          placeholder="Choose a profile"
          onSelect={(username) => {
            const selectedUser = users.find((user) => user.username === username);
            dispatch(setActiveUserId(selectedUser?.user_key));
          }}
        />
      ) : null}

      <InputField label="Search by username" value={search} onChangeText={setSearch} placeholder="@username" />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {relationshipMutationStatus === 'loading' ? (
        <Text style={styles.helperText}>Updating relationships on the backend...</Text>
      ) : null}

      <Text style={styles.sectionTitle}>Pending Friend Requests</Text>
      {pendingRequests.length > 0 ? (
        pendingRequests.map((request) => (
          <View key={request.user_key} style={styles.requestRow}>
            <Image source={{ uri: buildAvatarUrl(request.username) }} style={styles.avatar} />
            <Text style={styles.username}>{request.username}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.helperText}>No incoming requests for the selected profile yet.</Text>
      )}

      <View style={styles.columns}>
        <View style={styles.leftColumn}>
          <Text style={styles.sectionTitle}>Current Friends</Text>
          {friendConnections.length > 0 ? (
            friendConnections.map((friend) => (
              <View key={friend.relationshipId} style={styles.cardRow}>
                <Image source={{ uri: buildAvatarUrl(friend.user.username) }} style={styles.avatar} />
                <View style={styles.rowBody}>
                  <Text style={styles.username}>{friend.user.username}</Text>
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => void dispatch(deleteRelationship(friend.relationshipId))}>
                    <Text style={styles.buttonText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.helperText}>No accepted friendships yet.</Text>
          )}
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.sectionTitle}>Suggestions</Text>
          {suggestions.length > 0 ? (
            suggestions.map((profile) => (
              <View key={profile.user_key} style={styles.cardRow}>
                <Image source={{ uri: buildAvatarUrl(profile.username) }} style={styles.avatar} />
                <View style={styles.rowBody}>
                  <Text style={styles.username}>{profile.username}</Text>
                  <Pressable style={styles.addButton} onPress={() => void onSendRequest(profile.user_key)}>
                    <Text style={styles.buttonText}>Send Request</Text>
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.helperText}>No suggestions left for this search.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 120 },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
  },
  helperText: {
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  errorText: {
    color: colors.accentClay,
    fontWeight: '600',
    marginBottom: 10,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  columns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  leftColumn: { flex: 1 },
  rightColumn: { flex: 1.2 },
  cardRow: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    marginBottom: 8,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  rowBody: { marginLeft: 8, flex: 1, justifyContent: 'space-between' },
  username: { color: colors.textPrimary, fontWeight: '600' },
  addButton: {
    marginTop: 6,
    backgroundColor: colors.accentBlue,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButton: {
    marginTop: 6,
    backgroundColor: colors.accentClay,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: colors.white, fontSize: 12, fontWeight: '600' },
});
