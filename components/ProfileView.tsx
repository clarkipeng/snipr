import type { Schema } from '@/amplify/data/resource';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const client = generateClient<Schema>();

type ProfileData = {
  name: string;
  email: string;
  profilePictureUrl: string | null;
  snipesMade: number;
  snipesReceived: number;
  recentSnipeUrls: string[];
};

type ProfileViewProps = {
  userId?: string;
  showSignOut?: boolean;
};

export function ProfileView({ userId, showSignOut = false }: ProfileViewProps) {
  const { signOut } = useAuthenticator();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        let targetProfile;

        if (userId) {
          const { data } = await client.models.UserProfile.get({ id: userId });
          targetProfile = data;
        } else {
          const attributes = await fetchUserAttributes();
          const email = attributes.email;
          if (!email) return;
          const { data: profiles } = await client.models.UserProfile.list({
            filter: { email: { eq: email } },
          });
          targetProfile = profiles[0] ?? null;
        }

        if (!targetProfile) return;

        let profilePictureUrl: string | null = null;
        if (targetProfile.profilePicture) {
          try {
            const result = await getUrl({ path: targetProfile.profilePicture });
            profilePictureUrl = result.url.toString();
          } catch {}
        }

        const [{ data: made }, { data: received }] = await Promise.all([
          client.models.Snipe.list({ filter: { sniperId: { eq: targetProfile.id } } }),
          client.models.Snipe.list({ filter: { targetId: { eq: targetProfile.id } } }),
        ]);

        // Set profile immediately so the screen shows without waiting for grid images
        setProfile({
          name: targetProfile.name,
          email: targetProfile.email,
          profilePictureUrl,
          snipesMade: made.length,
          snipesReceived: received.length,
          recentSnipeUrls: [],
        });

        // Async: load up to 9 snipe thumbnails for the grid
        const sorted = [...made]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 9);

        const urls = (
          await Promise.all(
            sorted.map(async (snipe) => {
              try {
                const result = await getUrl({ path: snipe.imageKey });
                return result.url.toString();
              } catch {
                return null;
              }
            })
          )
        ).filter((u): u is string => u !== null);

        setProfile(prev => prev ? { ...prev, recentSnipeUrls: urls } : prev);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!profile) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Could not load profile.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.outer}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {profile.profilePictureUrl ? (
          <Image source={{ uri: profile.profilePictureUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <ThemedText style={styles.avatarInitial}>
              {profile.name.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
        )}

        <ThemedText type="title" style={styles.name}>{profile.name}</ThemedText>
        <ThemedText style={styles.email}>{profile.email}</ThemedText>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <ThemedText style={styles.statNumber}>{profile.snipesMade}</ThemedText>
            <ThemedText style={styles.statLabel}>Snipes</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <ThemedText style={styles.statNumber}>{profile.snipesReceived}</ThemedText>
            <ThemedText style={styles.statLabel}>Sniped</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <ThemedText style={styles.statNumber}>
              {profile.snipesMade - profile.snipesReceived}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Net</ThemedText>
          </View>
        </View>

        {/* Recent snipes grid */}
        {profile.recentSnipeUrls.length > 0 && (
          <View style={styles.gridSection}>
            <ThemedText style={styles.gridTitle}>Snipes</ThemedText>
            <View style={styles.grid}>
              {profile.recentSnipeUrls.map((url, i) => (
                <Image key={i} source={{ uri: url }} style={styles.gridImage} />
              ))}
            </View>
          </View>
        )}

        {showSignOut && (
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  container: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(150, 150, 150, 0.25)',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 42,
    fontWeight: '700',
  },
  name: {
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    opacity: 0.5,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 32,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, opacity: 0.5, marginTop: 4 },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
  },

  // Photo grid
  gridSection: { width: '100%', marginBottom: 32 },
  gridTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridImage: {
    width: '32.5%',
    aspectRatio: 1,
    borderRadius: 4,
    backgroundColor: '#222',
    margin: 1,
  },

  signOutButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  signOutText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 16,
  },
});
