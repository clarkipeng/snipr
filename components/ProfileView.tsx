/**
 * ProfileView Component
 *
 * Reusable profile display used by:
 * - Profile tab (shows current user + sign out)
 * - Modal (shows any user's profile when tapped from leaderboard)
 *
 * Props:
 * - userId: if provided, loads that user's profile. Otherwise loads current user.
 * - showSignOut: whether to show the sign out button (only for own profile)
 */

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
  StyleSheet,
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
          // Loading another user's profile by ID
          const { data } = await client.models.UserProfile.get({ id: userId });
          targetProfile = data;
        } else {
          // Loading current user's profile by email
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

        const { data: made } = await client.models.Snipe.list({
          filter: { sniperId: { eq: targetProfile.id } },
        });
        const { data: received } = await client.models.Snipe.list({
          filter: { targetId: { eq: targetProfile.id } },
        });

        setProfile({
          name: targetProfile.name,
          email: targetProfile.email,
          profilePictureUrl,
          snipesMade: made.length,
          snipesReceived: received.length,
        });
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
    <ThemedView style={styles.container}>
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

      {showSignOut && (
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 40,
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
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
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
