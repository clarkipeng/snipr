import type { Schema } from '@/amplify/data/resource';
import { SkeletonCard } from '@/components/SkeletonCard';
import { SnipeCard } from '@/components/SnipeCard';
import { getCachedUrl } from '@/utils/url-cache';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

const client = generateClient<Schema>();

type UserEntry = { id: string; name: string; email?: string; profilePicture?: string | null };

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Map<string, UserEntry>>(new Map());

  async function loadFeed() {
    try {
      setError(null);

      const attributes = await fetchUserAttributes();

      const { data: allUsers } = await client.models.UserProfile.list({ limit: 1000 });
      const currentUser = allUsers.find(u => u.email === attributes.email);
      const currentUserId = currentUser?.id ?? null;

      const { data: memberships } = await client.models.GroupMember.list({ filter: { userId: { eq: currentUserId ?? undefined } }, limit: 1000 });
      const groupIds = new Set(memberships.map(m => m.groupId));

      // Fetch all friend IDs across all friendships
      const { data: friendships } = await client.models.Friendship.list({ limit: 1000 });
      const friendIds = new Set<string>();
      friendships.forEach(f => {
        if (f.userId === currentUserId) friendIds.add(f.friendId);
        if (f.friendId === currentUserId) friendIds.add(f.userId);
      });

      const { data: snipes } = await client.models.Snipe.list({
        selectionSet: ['id', 'sniperId', 'targetId', 'imageKey', 'caption', 'createdAt'],
        limit: 1000
      });

      const uMap = new Map(allUsers.map(u => [u.id, u]));
      setUserMap(new Map(allUsers.map(u => [u.id, { id: u.id, name: u.name, email: u.email, profilePicture: u.profilePicture }])));
      setCurrentUserId(currentUser?.id ?? null);

      // Rule: You must be friends with BOTH the sniper AND the target (or be one of them)
      const isAllowed = (id: string | null) => id === currentUserId || (id && friendIds.has(id));
      const filtered = snipes.filter(s => isAllowed(s.sniperId) && isAllowed(s.targetId));

      const sorted = [...filtered]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 30);

      const items: FeedItem[] = await Promise.all(
        sorted.map(async (snipe) => {
          const user = uMap.get(snipe.sniperId);
          const profilePicPath = user?.profilePicture;

          const [sniperProfilePictureUrl, imageUrl] = await Promise.all([
            profilePicPath ? getCachedUrl(profilePicPath) : Promise.resolve(null),
            getCachedUrl(snipe.imageKey),
          ]);

          return {
            id: snipe.id,
            sniperName: uMap.get(snipe.sniperId)?.name ?? 'Unknown',
            targetName: uMap.get(snipe.targetId)?.name ?? 'Unknown',
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
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SnipeCard
            snipeId={item.id}
            sniperName={item.sniperName}
            targetName={item.targetName}
            sniperProfilePictureUrl={item.sniperProfilePictureUrl}
            imageUrl={item.imageUrl}
            caption={item.caption}
            createdAt={item.createdAt}
            currentUserId={currentUserId}
            userMap={userMap}
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
