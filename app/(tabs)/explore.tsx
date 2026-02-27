import type { Schema } from '@/amplify/data/resource';
import { LeaderboardRow } from '@/components/LeaderboardRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const client = generateClient<Schema>();

type LeaderboardEntry = {
  id: string;
  name: string;
  profilePictureUrl: string | null;
  snipeCount: number;
  timesSnipedCount: number;
};

// ─── Skeleton row ────────────────────────────────────────────────────────────

function SkeletonRow() {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View style={[skeletonStyles.row, { opacity }]}>
      <View style={skeletonStyles.badge} />
      <View style={skeletonStyles.avatar} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={skeletonStyles.lineA} />
        <View style={skeletonStyles.lineB} />
      </View>
    </Animated.View>
  );
}

const skeletonStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.15)',
  },
  badge: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(150,150,150,0.2)' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(150,150,150,0.2)' },
  lineA: { height: 13, width: '50%', borderRadius: 6, backgroundColor: 'rgba(150,150,150,0.25)' },
  lineB: { height: 10, width: '35%', borderRadius: 5, backgroundColor: 'rgba(150,150,150,0.15)' },
});

// ─── Podium for top 3 ────────────────────────────────────────────────────────

function Podium({
  top3,
  displayMultiplier,
  onPress,
}: {
  top3: LeaderboardEntry[];
  displayMultiplier: number;
  onPress: (id: string) => void;
}) {
  if (top3.length === 0) return null;

  // Order on screen: 2nd | 1st | 3rd  (classic podium layout)
  const slots = [
    { entry: top3[1] ?? null, medal: '🥈', blockHeight: 82, bg: 'rgba(192,192,192,0.18)' },
    { entry: top3[0] ?? null, medal: '🥇', blockHeight: 112, bg: 'rgba(255,215,0,0.18)' },
    { entry: top3[2] ?? null, medal: '🥉', blockHeight: 58,  bg: 'rgba(205,127,50,0.18)' },
  ];

  return (
    <View style={podiumStyles.container}>
      {slots.map(({ entry, medal, blockHeight, bg }, i) => {
        if (!entry) return <View key={i} style={{ flex: 1 }} />;
        return (
          <TouchableOpacity
            key={entry.id}
            style={podiumStyles.column}
            onPress={() => onPress(entry.id)}
            activeOpacity={0.8}
          >
            {entry.profilePictureUrl ? (
              <Image source={{ uri: entry.profilePictureUrl }} style={podiumStyles.avatar} />
            ) : (
              <View style={[podiumStyles.avatar, podiumStyles.avatarPlaceholder]}>
                <Text style={podiumStyles.avatarInitial}>{entry.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <ThemedText style={podiumStyles.name} numberOfLines={1}>
              {entry.name.split(' ')[0]}
            </ThemedText>
            <ThemedText style={podiumStyles.score}>
              {Math.round(entry.snipeCount * displayMultiplier)}
            </ThemedText>
            <View style={[podiumStyles.block, { height: blockHeight, backgroundColor: bg }]}>
              <Text style={podiumStyles.medal}>{medal}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const podiumStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 0,
  },
  column: { flex: 1, alignItems: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 26, marginBottom: 6 },
  avatarPlaceholder: {
    backgroundColor: 'rgba(150,150,150,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { fontWeight: '700', fontSize: 20, color: '#666' },
  name: { fontSize: 13, fontWeight: '600', marginBottom: 2, textAlign: 'center' },
  score: { fontSize: 12, opacity: 0.55, marginBottom: 6 },
  block: {
    width: '85%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
  },
  medal: { fontSize: 22 },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [displayMultiplier, setDisplayMultiplier] = useState(0);

  async function loadLeaderboard() {
    try {
      const { data: snipes } = await client.models.Snipe.list({
        selectionSet: ['sniperId', 'targetId'],
      });

      const snipesMade: Record<string, number> = {};
      const snipesReceived: Record<string, number> = {};
      for (const snipe of snipes) {
        snipesMade[snipe.sniperId] = (snipesMade[snipe.sniperId] || 0) + 1;
        snipesReceived[snipe.targetId] = (snipesReceived[snipe.targetId] || 0) + 1;
      }

      const attributes = await fetchUserAttributes();
      const { data: allUsers } = await client.models.UserProfile.list();
      const currentUser = allUsers.find(u => u.email === attributes.email);
      const currentUserIdLocal = currentUser?.id ?? null;

      const { data: friendshipRecords } = await client.models.Friendship.list();
      const friendIds = new Set(
        friendshipRecords
          .filter(f => f.userId === currentUserIdLocal)
          .map(f => f.friendId)
      );
      if (currentUserIdLocal) friendIds.add(currentUserIdLocal);

      const profiles = allUsers.filter(u => friendIds.has(u.id));

      const leaderboard: LeaderboardEntry[] = await Promise.all(
        profiles.map(async (profile) => {
          let profilePictureUrl: string | null = null;
          if (profile.profilePicture) {
            try {
              const result = await getUrl({ path: profile.profilePicture });
              profilePictureUrl = result.url.toString();
            } catch {}
          }
          return {
            id: profile.id,
            name: profile.name,
            profilePictureUrl,
            snipeCount: snipesMade[profile.id] || 0,
            timesSnipedCount: snipesReceived[profile.id] || 0,
          };
        })
      );

      leaderboard.sort((a, b) => b.snipeCount - a.snipeCount);
      setEntries(leaderboard);
      setCurrentUserId(currentUserIdLocal);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Animate scores counting up whenever entries change
  useEffect(() => {
    if (entries.length === 0) return;
    setDisplayMultiplier(0);
    const startTime = Date.now();
    const duration = 800;
    const interval = setInterval(() => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayMultiplier(eased);
      if (progress >= 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [entries]);

  useFocusEffect(
    useCallback(() => {
      loadLeaderboard();
    }, [])
  );

  function onRefresh() {
    setRefreshing(true);
    loadLeaderboard();
  }

  const myRank = currentUserId ? entries.findIndex(e => e.id === currentUserId) + 1 : 0;
  const myEntry = currentUserId ? entries.find(e => e.id === currentUserId) ?? null : null;

  if (loading && entries.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.header}>Leaderboard</ThemedText>
        {[0, 1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Leaderboard</ThemedText>

      <FlatList
        data={entries.slice(3)}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Podium
            top3={entries.slice(0, 3)}
            displayMultiplier={displayMultiplier}
            onPress={(id) => router.push({ pathname: '/modal', params: { userId: id } })}
          />
        }
        renderItem={({ item, index }) => (
          <LeaderboardRow
            rank={index + 4}
            name={item.name}
            profilePictureUrl={item.profilePictureUrl}
            snipeCount={item.snipeCount}
            timesSnipedCount={item.timesSnipedCount}
            displayMultiplier={displayMultiplier}
            onPress={() => router.push({ pathname: '/modal', params: { userId: item.id } })}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF3B30"
            colors={['#FF3B30']}
          />
        }
        ListEmptyComponent={
          entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🏆</Text>
              <ThemedText style={styles.emptyTitle}>No data yet</ThemedText>
              <ThemedText style={styles.emptySubtitle}>Start sniping to appear here!</ThemedText>
            </View>
          ) : null
        }
      />

      {/* Sticky "your rank" banner */}
      {myEntry && (
        <View style={styles.myRankBanner}>
          <ThemedText style={styles.myRankLabel}>Your rank</ThemedText>
          <ThemedText style={styles.myRankNumber}>#{myRank}</ThemedText>
          <ThemedText style={styles.myRankScore}>
            {Math.round(myEntry.snipeCount * displayMultiplier)} snipes
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, opacity: 0.5, textAlign: 'center' },
  myRankBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150,150,150,0.25)',
    backgroundColor: 'rgba(150,150,150,0.06)',
  },
  myRankLabel: { fontSize: 14, opacity: 0.6 },
  myRankNumber: { fontWeight: '800', fontSize: 22 },
  myRankScore: { fontSize: 14, opacity: 0.6 },
});
