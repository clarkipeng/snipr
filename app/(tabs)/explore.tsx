/**
 * Leaderboard Screen
 *
 * Displays all users ranked by total snipes made.
 * Uses the Snipe model to count snipes per user and the
 * LeaderboardRow component to render each row.
 *
 * Data flow:
 * 1. Fetch all Snipe records (sniperId + sniper name)
 * 2. Fetch all UserProfile records (for profile pictures)
 * 3. Count snipes made and received per user
 * 4. Sort by snipes made (descending) and render
 */

import type { Schema } from '@/amplify/data/resource';
import { LeaderboardRow } from '@/components/LeaderboardRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet } from 'react-native';

const client = generateClient<Schema>();

type LeaderboardEntry = {
  id: string;
  name: string;
  profilePictureUrl: string | null;
  snipeCount: number;
  timesSnipedCount: number;
};

export default function LeaderboardScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadLeaderboard() {
    try {
      // Step 1: Fetch all snipes
      const { data: snipes } = await client.models.Snipe.list({
        selectionSet: ['sniperId', 'targetId'],
      });

      // Step 2: Count snipes made and received per user ID
      const snipesMade: Record<string, number> = {};
      const snipesReceived: Record<string, number> = {};

      for (const snipe of snipes) {
        snipesMade[snipe.sniperId] = (snipesMade[snipe.sniperId] || 0) + 1;
        snipesReceived[snipe.targetId] = (snipesReceived[snipe.targetId] || 0) + 1;
      }

      // Step 3: Fetch all user profiles
      const { data: profiles } = await client.models.UserProfile.list();

      // Step 4: Build leaderboard entries with profile picture URLs
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

      // Step 5: Sort by snipe count descending
      leaderboard.sort((a, b) => b.snipeCount - a.snipeCount);

      setEntries(leaderboard);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  function onRefresh() {
    setRefreshing(true);
    loadLeaderboard();
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
      <ThemedText type="title" style={styles.header}>Leaderboard</ThemedText>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <LeaderboardRow
            rank={index + 1}
            name={item.name}
            profilePictureUrl={item.profilePictureUrl}
            snipeCount={item.snipeCount}
            timesSnipedCount={item.timesSnipedCount}
            onPress={() => router.push({ pathname: '/modal', params: { userId: item.id } })}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <ThemedView style={styles.centered}>
            <ThemedText style={styles.emptyText}>No snipes yet. Be the first!</ThemedText>
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
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
  },
});
