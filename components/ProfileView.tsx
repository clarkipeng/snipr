import type { Schema } from '@/amplify/data/resource';
import { getCachedUrl } from '@/utils/url-cache';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
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

type FriendStatus = 'self' | 'friends' | 'request_sent' | 'not_friends';

export function ProfileView({ userId, showSignOut = false }: ProfileViewProps) {
  const { signOut } = useAuthenticator();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('self');
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        const [attributes, { data: allUsers }] = await Promise.all([
          fetchUserAttributes(),
          client.models.UserProfile.list(),
        ]);

        const currentEmail = attributes.email;
        const userMap = new Map(allUsers.map(u => [u.id, u]));
        const me = allUsers.find(u => u.email === currentEmail);
        const meId = me?.id ?? null;
        if (!cancelled) setCurrentUserId(meId);

        const targetProfile = userId
          ? userMap.get(userId) ?? null
          : me ?? null;

        if (!targetProfile || cancelled) return;

        const isViewingSelf = !userId || userId === meId;

        const [{ data: made }, { data: received }, friendStatusResult] = await Promise.all([
          client.models.Snipe.list({ filter: { sniperId: { eq: targetProfile.id } } }),
          client.models.Snipe.list({ filter: { targetId: { eq: targetProfile.id } } }),
          isViewingSelf || !meId
            ? Promise.resolve(null)
            : Promise.all([
                client.models.Friendship.list({ filter: { userId: { eq: meId } } }),
                client.models.FriendRequest.list({ filter: { senderId: { eq: meId } } }),
              ]),
        ]);

        if (cancelled) return;

        if (isViewingSelf) {
          setFriendStatus('self');
        } else if (friendStatusResult) {
          const [{ data: friendships }, { data: requests }] = friendStatusResult;
          const isFriend = friendships.some(f => f.friendId === targetProfile.id);
          const hasSentRequest = requests.some(r => r.receiverId === targetProfile.id);
          setFriendStatus(isFriend ? 'friends' : hasSentRequest ? 'request_sent' : 'not_friends');
        }

        const profilePictureUrl = targetProfile.profilePicture
          ? await getCachedUrl(targetProfile.profilePicture)
          : null;

        setProfile({
          name: targetProfile.name,
          email: targetProfile.email,
          profilePictureUrl,
          snipesMade: made.length,
          snipesReceived: received.length,
          recentSnipeUrls: [],
        });

        const sorted = [...made]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 9);

        const urls = (
          await Promise.all(sorted.map(snipe => getCachedUrl(snipe.imageKey)))
        ).filter((u): u is string => u !== null);

        if (!cancelled) {
          setProfile(prev => prev ? { ...prev, recentSnipeUrls: urls } : prev);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, [userId]);

  const sendFriendRequest = async () => {
    if (!currentUserId || !userId) return;
    setFriendActionLoading(true);
    try {
      await client.models.FriendRequest.create({
        senderId: currentUserId,
        receiverId: userId,
      });
      setFriendStatus('request_sent');
    } catch (err) {
      console.error('Failed to send friend request:', err);
    } finally {
      setFriendActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF3B30" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Could not load profile.</Text>
      </View>
    );
  }

  return (
    <View style={styles.outer}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {profile.profilePictureUrl ? (
          <Image source={{ uri: profile.profilePictureUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>

        {friendStatus === 'friends' && (
          <View style={[styles.friendButton, styles.friendButtonFriends]}>
            <Text style={styles.friendButtonTextFriends}>Friends ✓</Text>
          </View>
        )}
        {friendStatus === 'not_friends' && (
          <TouchableOpacity
            style={[styles.friendButton, styles.friendButtonAdd]}
            onPress={sendFriendRequest}
            disabled={friendActionLoading}
          >
            {friendActionLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.friendButtonTextAdd}>Add Friend</Text>
            )}
          </TouchableOpacity>
        )}
        {friendStatus === 'request_sent' && (
          <View style={[styles.friendButton, styles.friendButtonPending]}>
            <Text style={styles.friendButtonTextPending}>Request Sent</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile.snipesMade}</Text>
            <Text style={styles.statLabel}>Snipes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile.snipesReceived}</Text>
            <Text style={styles.statLabel}>Sniped</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {profile.snipesMade - profile.snipesReceived}
            </Text>
            <Text style={styles.statLabel}>Net</Text>
          </View>
        </View>

        {profile.snipesMade === 0 && profile.snipesReceived === 0 && (
          <View style={styles.emptySnipes}>
            <Text style={styles.emptySnipesEmoji}>🥷</Text>
            <Text style={styles.emptySnipesText}>
              No snipes yet — still lurking in the shadows...
            </Text>
          </View>
        )}

        {profile.recentSnipeUrls.length > 0 && (
          <View style={styles.gridSection}>
            <Text style={styles.gridTitle}>Snipes</Text>
            <View style={styles.grid}>
              {profile.recentSnipeUrls.map((url, i) => (
                <Image key={i} source={{ uri: url }} style={styles.gridImage} />
              ))}
            </View>
          </View>
        )}

        {showSignOut && (
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#0B0B0F' },
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
    backgroundColor: '#0B0B0F',
  },
  errorText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 42,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15151B',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 32,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  gridSection: { width: '100%', marginBottom: 32 },
  gridTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#fff' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridImage: {
    width: '32.5%',
    aspectRatio: 1,
    borderRadius: 6,
    backgroundColor: '#15151B',
    margin: 1,
  },

  friendButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  friendButtonAdd: {
    backgroundColor: '#34C759',
  },
  friendButtonTextAdd: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  friendButtonFriends: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  friendButtonTextFriends: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    fontSize: 15,
  },
  friendButtonPending: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  friendButtonTextPending: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    fontSize: 15,
  },
  emptySnipes: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  emptySnipesEmoji: {
    fontSize: 40,
  },
  emptySnipesText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: 'rgba(255,59,48,0.12)',
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
