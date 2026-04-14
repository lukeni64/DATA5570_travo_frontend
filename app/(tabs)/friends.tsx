import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { InputField } from '@/components/InputField';
import { colors } from '@/constants/theme';
import { Friend, FriendRequest } from '@/types/models';

const friendsSeed: Friend[] = [
  { id: 1, username: 'wander.maya', image: 'https://i.pravatar.cc/100?img=32' },
  { id: 2, username: 'nomad.lee', image: 'https://i.pravatar.cc/100?img=13' },
  { id: 3, username: 'trip.jordan', image: 'https://i.pravatar.cc/100?img=41' },
];

const pendingSeed: FriendRequest[] = [
  { id: 91, username: 'coast.kevin', image: 'https://i.pravatar.cc/100?img=8' },
  { id: 92, username: 'mountain.jill', image: 'https://i.pravatar.cc/100?img=20' },
];

const suggestionsSeed: Friend[] = [
  { id: 7, username: 'route.anna', image: 'https://i.pravatar.cc/100?img=24' },
  { id: 8, username: 'scenic.jade', image: 'https://i.pravatar.cc/100?img=26' },
  { id: 9, username: 'rv.noah', image: 'https://i.pravatar.cc/100?img=35' },
];

export default function FriendsScreen() {
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState(friendsSeed);
  const [pending] = useState(pendingSeed);
  const [suggestions] = useState(suggestionsSeed);

  const filteredSuggestions = useMemo(
    () => suggestions.filter((user) => user.username.toLowerCase().includes(search.toLowerCase())),
    [search, suggestions],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <InputField label="Search by username" value={search} onChangeText={setSearch} placeholder="@username" />

      <Text style={styles.sectionTitle}>Pending Friend Requests</Text>
      {pending.map((request) => (
        <View key={request.id} style={styles.requestRow}>
          <Image source={{ uri: request.image }} style={styles.avatar} />
          <Text style={styles.username}>{request.username}</Text>
        </View>
      ))}

      <View style={styles.columns}>
        <View style={styles.leftColumn}>
          <Text style={styles.sectionTitle}>Current Friends</Text>
          {friends.map((friend) => (
            <View key={friend.id} style={styles.cardRow}>
              <Image source={{ uri: friend.image }} style={styles.avatar} />
              <View style={styles.rowBody}>
                <Text style={styles.username}>{friend.username}</Text>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => setFriends((current) => current.filter((item) => item.id !== friend.id))}>
                  <Text style={styles.buttonText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.sectionTitle}>Suggestions</Text>
          {filteredSuggestions.map((profile) => (
            <View key={profile.id} style={styles.cardRow}>
              <Image source={{ uri: profile.image }} style={styles.avatar} />
              <View style={styles.rowBody}>
                <Text style={styles.username}>{profile.username}</Text>
                <Pressable style={styles.addButton}>
                  <Text style={styles.buttonText}>Send Request</Text>
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
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
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
