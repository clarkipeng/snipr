import type { Schema } from '@/amplify/data/resource';
import { SkeletonCard } from '@/components/SkeletonCard';
import { SnipeCard } from '@/components/SnipeCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { useEffect, useState } from 'react';
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

  async function loadFeed() {
    try {
      setError(null);

      const attributes = await fetchUserAttributes();
      const { data: allUsers } = await client.models.UserProfile.list();
      const currentUser = allUsers.find(u => u.email === attributes.email);
      const currentUserId = currentUser?.id ?? null;

      const { data: friendshipRecords } = await client.models.Friendship.list();
      const friendIds = new Set(
        friendshipRecords
          .filter(f => f.userId === currentUserId)
          .map(f => f.friendId)
      );

      // Build O(1) lookup map from pre-fetched users
      const userMap = new Map(allUsers.map(u => [u.id, u]));

      function getProfileName(id: string): string {
        return userMap.get(id)?.name ?? 'Unknown';
      }

      // Cache signed profile picture URLs so each sniper's pic is only fetched once
      const picUrlCache = new Map<string, string | null>();
      async function getProfilePicUrl(id: string): Promise<string | null> {
        if (picUrlCache.has(id)) return picUrlCache.get(id)!;
        const user = userMap.get(id);
        if (!user?.profilePicture) {
          picUrlCache.set(id, null);
          return null;
        }
        try {
          const result = await getUrl({ path: user.profilePicture });
          const url = result.url.toString();
          picUrlCache.set(id, url);
          return url;
        } catch {
          picUrlCache.set(id, null);
          return null;
        }
      }

      const { data: snipes } = await client.models.Snipe.list({
        selectionSet: ['id', 'sniperId', 'targetId', 'imageKey', 'caption', 'createdAt'],
      });

      const filtered = snipes.filter(s => friendIds.has(s.sniperId) || s.sniperId === currentUserId);
      const sorted = [...filtered]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 30);

      const items: FeedItem[] = await Promise.all(
        sorted.map(async (snipe) => {
          const [sniperProfilePictureUrl, imageUrl] = await Promise.all([
            getProfilePicUrl(snipe.sniperId),
            (async () => {
              try {
                const result = await getUrl({ path: snipe.imageKey });
                return result.url.toString();
              } catch {
                return null;
              }
            })(),
          ]);

          return {
            id: snipe.id,
            sniperName: getProfileName(snipe.sniperId),
            targetName: getProfileName(snipe.targetId),
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

  useEffect(() => {
    loadFeed();
  }, []);

  function onRefresh() {
    setRefreshing(true);
    loadFeed();
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.header}>Feed</ThemedText>
        <View style={styles.listContent}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Feed</ThemedText>
      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
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
            <ThemedText style={styles.emptyTitle}>Nothing here yet</ThemedText>
            <ThemedText style={styles.emptySubtitle}>Add friends and start sniping!</ThemedText>
          </View>
        }
      />
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  errorText: {
    color: '#ff3b30',
    paddingHorizontal: 20,
    paddingBottom: 8,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
  },
});
