import type { Schema } from '@/amplify/data/resource';
import { LeaderboardRow } from '@/components/LeaderboardRow';
import { ModeToggle } from '@/components/ModeToggle';
import { getCachedUrl } from '@/utils/url-cache';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
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

function SkeletonRow() {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

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
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  badge: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.08)' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)' },
  lineA: { height: 13, width: '50%', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)' },
  lineB: { height: 10, width: '35%', borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.05)' },
});

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

  const slots = [
    { entry: top3[1] ?? null, medal: '🥈', blockHeight: 82, bg: 'rgba(192,192,192,0.12)' },
    { entry: top3[0] ?? null, medal: '🥇', blockHeight: 112, bg: 'rgba(255,215,0,0.12)' },
    { entry: top3[2] ?? null, medal: '🥉', blockHeight: 58,  bg: 'rgba(205,127,50,0.12)' },
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
            <Text style={podiumStyles.name} numberOfLines={1}>
              {entry.name.split(' ')[0]}
            </Text>
            <Text style={podiumStyles.score}>
              {Math.round(entry.snipeCount * displayMultiplier)}
            </Text>
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { fontWeight: '700', fontSize: 20, color: 'rgba(255,255,255,0.6)' },
  name: { fontSize: 13, fontWeight: '600', marginBottom: 2, textAlign: 'center', color: '#fff' },
  score: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
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

export default function LeaderboardScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [displayMultiplier, setDisplayMultiplier] = useState(0);
  const [mode, setMode] = useState<'friends' | 'global'>('friends');
  const modeRef = useRef(mode);
  modeRef.current = mode;

  async function loadLeaderboard(currentMode: 'friends' | 'global' = modeRef.current) {
    try {
      const [{ data: snipes }, attributes, { data: allUsers }, { data: friendshipRecords }] =
        await Promise.all([
          client.models.Snipe.list({ selectionSet: ['sniperId', 'targetId'] }),
          fetchUserAttributes(),
          client.models.UserProfile.list(),
          client.models.Friendship.list(),
        ]);

      const snipesMade: Record<string, number> = {};
      const snipesReceived: Record<string, number> = {};
      for (const snipe of snipes) {
        snipesMade[snipe.sniperId] = (snipesMade[snipe.sniperId] || 0) + 1;
        snipesReceived[snipe.targetId] = (snipesReceived[snipe.targetId] || 0) + 1;
      }

      const currentUser = allUsers.find(u => u.email === attributes.email);
      const currentUserIdLocal = currentUser?.id ?? null;

      const friendIds = new Set(
        friendshipRecords
          .filter(f => f.userId === currentUserIdLocal)
          .map(f => f.friendId)
      );
      if (currentUserIdLocal) friendIds.add(currentUserIdLocal);

      const profiles = currentMode === 'global'
        ? allUsers
        : allUsers.filter(u => friendIds.has(u.id));

      const leaderboard: LeaderboardEntry[] = await Promise.all(
        profiles.map(async (profile) => ({
          id: profile.id,
          name: profile.name,
          profilePictureUrl: profile.profilePicture
            ? await getCachedUrl(profile.profilePicture)
            : null,
          snipeCount: snipesMade[profile.id] || 0,
          timesSnipedCount: snipesReceived[profile.id] || 0,
        }))
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

  useEffect(() => {
    if (entries.length === 0) return;
    setDisplayMultiplier(0);
    const startTime = Date.now();
    const duration = 800;
    const interval = setInterval(() => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
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

  useEffect(() => {
    loadLeaderboard(mode);
  }, [mode]);

  function onRefresh() {
    setRefreshing(true);
    loadLeaderboard();
  }

  const myRank = currentUserId ? entries.findIndex(e => e.id === currentUserId) + 1 : 0;
  const myEntry = currentUserId ? entries.find(e => e.id === currentUserId) ?? null : null;

  if (loading && entries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>LEADERBOARD</Text>
        {[0, 1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>LEADERBOARD</Text>
      <ModeToggle mode={mode} onModeChange={setMode} />

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
              <Text style={styles.emptyTitle}>No data yet</Text>
              <Text style={styles.emptySubtitle}>Start sniping to appear here!</Text>
            </View>
          ) : null
        }
      />

      {myEntry && (
        <View style={styles.myRankBanner}>
          <Text style={styles.myRankLabel}>Your rank</Text>
          <Text style={styles.myRankNumber}>#{myRank}</Text>
          <Text style={styles.myRankScore}>
            {Math.round(myEntry.snipeCount * displayMultiplier)} snipes
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 14,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  emptySubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center' },
  myRankBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#15151B',
  },
  myRankLabel: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  myRankNumber: { fontWeight: '800', fontSize: 22, color: '#fff' },
  myRankScore: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
});
