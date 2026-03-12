import type { Schema } from "@/amplify/data/resource";
import { SkeletonCard } from "@/components/SkeletonCard";
import { SnipeCard } from "@/components/SnipeCard";
import { checkAndAwardBadges } from "@/utils/badge-checker";
import { getCachedUrl } from "@/utils/url-cache";
import { useFocusEffect } from "@react-navigation/native";
import { fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const client = generateClient<Schema>();

type UserEntry = { id: string; name: string; email?: string; profilePicture?: string | null };

type FeedItem = {
  id: string;
  sniperId: string;
  targetId: string;
  sniperName: string;
  targetName: string;
  sniperProfilePictureUrl: string | null;
  imageUrl: string | null;
  caption: string | null;
  createdAt: string;
  score: number | null;
  hasVoted: boolean;
};

export default function HomeScreen() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Map<string, UserEntry>>(new Map());
  const [dateFilter, setDateFilter] = useState<
    "all" | "1h" | "24h" | "7d" | "30d"
  >("all");
  const [friendSearch, setFriendSearch] = useState("");

  async function loadFeed() {
    try {
      setError(null);

      const attributes = await fetchUserAttributes();

      const { data: allUsers } = await client.models.UserProfile.list({
        limit: 1000,
      });
      const currentUser = allUsers.find((u) => u.email === attributes.email);
      const currentUserId = currentUser?.id ?? null;

      const { data: memberships } = await client.models.GroupMember.list({
        filter: { userId: { eq: currentUserId ?? undefined } },
        limit: 1000,
      });
      const groupIds = new Set(memberships.map((m) => m.groupId));

      // Fetch all friend IDs across all friendships
      const { data: friendships } = await client.models.Friendship.list({
        limit: 1000,
      });
      const friendIds = new Set<string>();
      friendships.forEach((f) => {
        if (f.userId === currentUserId) friendIds.add(f.friendId);
        if (f.friendId === currentUserId) friendIds.add(f.userId);
      });

      const { data: snipes } = await client.models.Snipe.list({
        selectionSet: [
          "id",
          "sniperId",
          "targetId",
          "imageKey",
          "caption",
          "score",
          "createdAt",
        ],
        limit: 1000,
      });

      // Fetch all votes by this user once and build a lookup set.
      const votedSnipeIds = new Set<string>();
      if (currentUserId) {
        try {
          const { data: myVotes } = await client.models.SnipeVote.list({
            filter: { userId: { eq: currentUserId } },
            limit: 1000,
          });
          myVotes.forEach((v) => {
            if (v.snipeId) votedSnipeIds.add(v.snipeId);
          });
        } catch (e) {
          console.warn("Failed to load votes for current user:", e);
        }
      }

      const uMap = new Map(allUsers.map((u) => [u.id, u]));
      setUserMap(
        new Map(
          allUsers.map((u) => [
            u.id,
            {
              id: u.id,
              name: u.name,
              email: u.email,
              profilePicture: (u as any).profilePicture ?? null,
            },
          ]),
        ),
      );
      setCurrentUserId(currentUser?.id ?? null);

      // Rule: You must be friends with BOTH the sniper AND the target (or be one of them)
      const isAllowed = (id: string | null) =>
        id === currentUserId || (id && friendIds.has(id));
      const filtered = snipes.filter(
        (s) => isAllowed(s.sniperId) && isAllowed(s.targetId),
      );

      const sorted = [...filtered].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      const items: FeedItem[] = await Promise.all(
        sorted.map(async (snipe) => {
          const user = uMap.get(snipe.sniperId);
          const profilePicPath = user?.profilePicture;

          const [sniperProfilePictureUrl, imageUrl] = await Promise.all([
            profilePicPath
              ? getCachedUrl(profilePicPath)
              : Promise.resolve(null),
            getCachedUrl(snipe.imageKey),
          ]);

          return {
            id: snipe.id,
            sniperId: snipe.sniperId,
            targetId: snipe.targetId,
            sniperName: uMap.get(snipe.sniperId)?.name ?? "Unknown",
            targetName: uMap.get(snipe.targetId)?.name ?? "Unknown",
            sniperProfilePictureUrl,
            imageUrl,
            caption: snipe.caption ?? null,
            createdAt: snipe.createdAt,
            score: typeof snipe.score === "number" ? snipe.score : null,
            hasVoted: votedSnipeIds.has(snipe.id),
          };
        }),
      );

      setFeed(items);

      // Check and award badges for current user (run in background)
      if (currentUserId) {
        checkAndAwardBadges(currentUserId).catch(err => {
          console.error('Failed to check badges:', err);
        });
      }
    } catch (err) {
      console.error("Failed to load feed:", err);
      setError("Failed to load feed. Pull down to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, []),
  );

  const filteredFeed = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;
    const dateCutoff =
      dateFilter === "1h"
        ? now - oneHour
        : dateFilter === "24h"
          ? now - oneDay
          : dateFilter === "7d"
            ? now - 7 * oneDay
            : dateFilter === "30d"
              ? now - 30 * oneDay
              : 0;

    const q = friendSearch.trim().toLowerCase();
    return feed.filter((item) => {
      if (dateCutoff > 0 && new Date(item.createdAt).getTime() < dateCutoff)
        return false;
      if (
        q &&
        !item.sniperName.toLowerCase().includes(q) &&
        !item.targetName.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [feed, dateFilter, friendSearch]);

  function onRefresh() {
    setRefreshing(true);
    loadFeed();
  }

  const handleScoreChange = useCallback((snipeId: string, newScore: number) => {
    setFeed((prev) =>
      prev.map((item) =>
        item.id === snipeId ? { ...item, score: newScore } : item,
      ),
    );
  }, []);

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
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.filterRow}>
        <View style={styles.dateFilterRow}>
          {(["all", "1h", "24h", "7d", "30d"] as const).map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => setDateFilter(key)}
              style={[
                styles.dateChip,
                dateFilter === key && styles.dateChipActive,
              ]}
            >
              <Text
                style={[
                  styles.dateChipText,
                  dateFilter === key && styles.dateChipTextActive,
                ]}
              >
                {key === "all"
                  ? "All"
                  : key === "1h"
                    ? "1h"
                    : key === "24h"
                      ? "24h"
                      : key === "7d"
                        ? "7 days"
                        : "30 days"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by friend..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={friendSearch}
          onChangeText={setFriendSearch}
        />
      </View>

      <FlatList
        data={filteredFeed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SnipeCard
            snipeId={item.id}
            sniperId={item.sniperId}
            targetId={item.targetId}
            sniperName={item.sniperName}
            targetName={item.targetName}
            sniperProfilePictureUrl={item.sniperProfilePictureUrl}
            imageUrl={item.imageUrl}
            caption={item.caption}
            createdAt={item.createdAt}
            score={item.score}
            currentUserId={currentUserId}
            userMap={userMap}
            initialHasVoted={item.hasVoted}
            onScoreChange={handleScoreChange}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF3B30"
            colors={["#FF3B30"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {feed.length === 0
                ? "Nothing here yet"
                : "No snipes match your filters"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {feed.length === 0
                ? "Add friends and start sniping!"
                : "Try a different date or search."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 14,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#fff",
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  dateFilterRow: {
    flexDirection: "row",
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dateChipActive: {
    backgroundColor: "#FF3B30",
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  dateChipTextActive: {
    color: "#fff",
  },
  searchInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#fff",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  errorText: {
    color: "#FF3B30",
    paddingHorizontal: 20,
    paddingBottom: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
  },
});
