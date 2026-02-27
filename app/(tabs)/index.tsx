import type { Schema } from '@/amplify/data/resource';
import { ModeToggle } from '@/components/ModeToggle';
import { SkeletonCard } from '@/components/SkeletonCard';
import { SnipeCard } from '@/components/SnipeCard';
import { getCachedUrl } from '@/utils/url-cache';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

const client = generateClient<Schema>();

type FeedItem = {
  id: string;
  sniperName: string;
  targetName: string;
  sniperProfilePictureUrl: string | null;
  imageUrl: string | null;
  caption: string | null;
  createdAt: string;
};

export default function HomeScreen() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mode, setMode] = useState<'friends' | 'global'>('friends');
  const modeRef = useRef(mode);
  modeRef.current = mode;

  async function loadFeed(currentMode: 'friends' | 'global' = modeRef.current) {
    try {
      setError(null);

      const [attributes, { data: allUsers }, { data: friendshipRecords }, { data: snipes }] =
        await Promise.all([
          fetchUserAttributes(),
          client.models.UserProfile.list(),
          client.models.Friendship.list(),
          client.models.Snipe.list({
            selectionSet: ['id', 'sniperId', 'targetId', 'imageKey', 'caption', 'createdAt'],
          }),
        ]);

      const currentUser = allUsers.find(u => u.email === attributes.email);
      const currentUserId = currentUser?.id ?? null;

      const friendIds = new Set(
        friendshipRecords
          .filter(f => f.userId === currentUserId)
          .map(f => f.friendId)
      );

      const userMap = new Map(allUsers.map(u => [u.id, u]));

      const filtered = currentMode === 'global'
        ? snipes
        : snipes.filter(s => friendIds.has(s.sniperId) || s.sniperId === currentUserId);
      const sorted = [...filtered]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 30);

      const items: FeedItem[] = await Promise.all(
        sorted.map(async (snipe) => {
          const user = userMap.get(snipe.sniperId);
          const profilePicPath = user?.profilePicture;

          const [sniperProfilePictureUrl, imageUrl] = await Promise.all([
            profilePicPath ? getCachedUrl(profilePicPath) : Promise.resolve(null),
            getCachedUrl(snipe.imageKey),
          ]);

          return {
            id: snipe.id,
            sniperName: userMap.get(snipe.sniperId)?.name ?? 'Unknown',
            targetName: userMap.get(snipe.targetId)?.name ?? 'Unknown',
            sniperProfilePictureUrl,
            imageUrl,
            caption: snipe.caption ?? null,
            createdAt: snipe.createdAt,
          };
        })
      );

      setFeed(items);
    } catch (err) {
      console.error('Failed to load feed:', err);
      setError('Failed to load feed. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [])
  );

  useEffect(() => {
    loadFeed(mode);
  }, [mode]);

  function onRefresh() {
    setRefreshing(true);
    loadFeed();
  }

  if (loading && feed.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>MISSION FEED</Text>
        <View style={styles.listContent}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>MISSION FEED</Text>
      <ModeToggle mode={mode} onModeChange={setMode} />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SnipeCard
            sniperName={item.sniperName}
            targetName={item.targetName}
            sniperProfilePictureUrl={item.sniperProfilePictureUrl}
            imageUrl={item.imageUrl}
            caption={item.caption}
            createdAt={item.createdAt}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF3B30"
            colors={['#FF3B30']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptySubtitle}>Add friends and start sniping!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 14,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  errorText: {
    color: '#FF3B30',
    paddingHorizontal: 20,
    paddingBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
  },
});
