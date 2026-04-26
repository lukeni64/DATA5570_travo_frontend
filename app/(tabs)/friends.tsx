import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { InputField } from '@/components/InputField';
import { colors } from '@/constants/theme';
import { listRelationships, listUsers, sendFriendRequest } from '@/services/travoApi';
import { Friend } from '@/types/models';

const CURRENT_USERNAME = 'traveler.jules';

function avatarFor(username: string) {
  return `https://i.pravatar.cc/100?u=${encodeURIComponent(username)}`;
}

export default function FriendsScreen() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [suggestions, setSuggestions] = useState<Friend[]>([]);

  const refresh = async () => {
    try {
      setLoading(true);
      const [users, relationships] = await Promise.all([
        listUsers(),
        listRelationships(CURRENT_USERNAME),
      ]);

      const userById = new Map(users.map((u) => [u.user_key, u.username]));
      const acceptedOtherUsernames = new Set<string>();
      const connectedUsernames = new Set<string>();

      for (const rel of relationships) {
        const requester = userById.get(rel.requester);
        const addressee = userById.get(rel.addressee);
        if (!requester || !addressee) continue;

        const iAmRequester = requester === CURRENT_USERNAME;
        const iAmAddressee = addressee === CURRENT_USERNAME;
        if (!iAmRequester && !iAmAddressee) continue;

        const other = iAmRequester ? addressee : requester;
        connectedUsernames.add(other);
        if (rel.status === 'accepted') acceptedOtherUsernames.add(other);
      }

      const nextFriends: Friend[] = [...acceptedOtherUsernames].map((username, idx) => ({
        id: idx + 1,
        username,
        image: avatarFor(username),
      }));

      const excluded = new Set<string>([CURRENT_USERNAME, ...connectedUsernames]);

      const nextSuggestions: Friend[] = users
        .map((u) => u.username)
        .filter((u) => !excluded.has(u))
        .slice(0, 30)
        .map((username, idx) => ({
          id: idx + 2000,
          username,
          image: avatarFor(username),
        }));

      setFriends(nextFriends);
      setSuggestions(nextSuggestions);
    } catch (e) {
      Alert.alert('Failed to load friends', e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filteredSuggestions = useMemo(
    () => suggestions.filter((user) => user.username.toLowerCase().includes(search.toLowerCase())),
    [search, suggestions],
  );

  const onAddFriend = async (username: string) => {
    try {
      setSubmitting(username);
      await sendFriendRequest({
        requester_username: CURRENT_USERNAME,
        addressee_username: username,
      });
      // Optimistically move user from suggestions to friends list
      const newFriend: Friend = { id: Date.now(), username, image: avatarFor(username) };
      setFriends((prev) => [...prev, newFriend]);
      setSuggestions((prev) => prev.filter((s) => s.username !== username));
    } catch (e) {
      Alert.alert('Failed to add friend', e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <InputField label="Search by username" value={search} onChangeText={setSearch} placeholder="@username" />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : null}

      <View style={styles.columns}>
        <View style={styles.leftColumn}>
          <Text style={styles.sectionTitle}>Friends</Text>
          {friends.map((friend) => (
            <View key={friend.id} style={styles.cardRow}>
              <Image source={{ uri: friend.image }} style={styles.avatar} />
              <View style={styles.rowBody}>
                <Text style={styles.username}>{friend.username}</Text>
              </View>
            </View>
          ))}
          {!loading && friends.length === 0 && (
            <Text style={styles.emptyText}>No friends yet. Add some!</Text>
          )}
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.sectionTitle}>Suggestions</Text>
          {filteredSuggestions.map((profile) => (
            <View key={profile.id} style={styles.cardRow}>
              <Image source={{ uri: profile.image }} style={styles.avatar} />
              <View style={styles.rowBody}>
                <Text style={styles.username}>{profile.username}</Text>
                <Pressable
                  style={styles.addButton}
                  disabled={submitting === profile.username}
                  onPress={() => void onAddFriend(profile.username)}>
                  <Text style={styles.buttonText}>
                    {submitting === profile.username ? 'Adding…' : 'Add Friend'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 120 },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  loadingText: { color: colors.textPrimary },
  emptyText: { color: colors.textPrimary, opacity: 0.5, fontSize: 13 },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
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
  buttonText: { color: colors.white, fontSize: 12, fontWeight: '600' },
});
