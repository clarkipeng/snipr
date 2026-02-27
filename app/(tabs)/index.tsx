import type { Schema } from '@/amplify/data/resource';
import { SnipeCard } from '@/components/SnipeCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet } from 'react-native';

const client = generateClient<Schema>();

type FeedItem = {
  id: string;
  sniperName: string;
  targetName: string;
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

      // Resolve current user and their friend IDs
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

      // Fetch all snipes with needed fields
      const { data: snipes } = await client.models.Snipe.list({
        selectionSet: ['id', 'sniperId', 'targetId', 'imageKey', 'caption', 'createdAt'],
      });

      // Filter to friends' snipes and own snipes, sort newest first, take top 30
      const filtered = snipes.filter(s => friendIds.has(s.sniperId) || s.sniperId === currentUserId);
      const sorted = [...filtered]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 30);

      // In-memory cache so each UserProfile is fetched at most once per load
      const profileCache = new Map<string, string>();

      async function getProfileName(id: string): Promise<string> {
        if (profileCache.has(id)) return profileCache.get(id)!;
        const { data } = await client.models.UserProfile.get({ id });
        const name = data?.name ?? 'Unknown';
        profileCache.set(id, name);
        return name;
      }

      const items: FeedItem[] = await Promise.all(
        sorted.map(async (snipe) => {
          const [sniperName, targetName] = await Promise.all([
            getProfileName(snipe.sniperId),
            getProfileName(snipe.targetId),
          ]);

          let imageUrl: string | null = null;
          try {
            const result = await getUrl({ path: snipe.imageKey });
            imageUrl = result.url.toString();
          } catch {}

          return {
            id: snipe.id,
            sniperName,
            targetName,
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
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
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
            imageUrl={item.imageUrl}
            caption={item.caption}
            createdAt={item.createdAt}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <ThemedView style={styles.centered}>
            <ThemedText style={styles.emptyText}>No snipes yet. Go snipe someone!</ThemedText>
          </ThemedView>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
  },
});
