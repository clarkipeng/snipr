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
  TextInput,
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
  topSnipers: {
    user: Schema['UserProfile']['type'];
    score: number;
  }[];
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
  const [profileId, setProfileId] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('self');
  const [friendActionLoading, setFriendActionLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

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
        if (!cancelled) setProfileId(targetProfile.id);

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

        const receivedFromScores = new Map<string, number>();
        received.forEach(s => {
          const snipeScore = typeof s.score === 'number' ? s.score : 0;
          receivedFromScores.set(
            s.sniperId,
            (receivedFromScores.get(s.sniperId) || 0) + snipeScore,
          );
        });

        const topSnipers = Array.from(receivedFromScores.entries())
          .map(([sniperId, score]) => ({
            user: userMap.get(sniperId)!,
            score,
          }))
          .filter(item => item.user)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        setProfile({
          name: targetProfile.name,
          email: targetProfile.email,
          profilePictureUrl,
          snipesMade: made.length,
          snipesReceived: received.length,
          recentSnipeUrls: [],
          topSnipers,
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

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || !profileId) return;
    setSavingName(true);
    try {
      await client.models.UserProfile.update({ id: profileId, name: trimmed });
      setProfile(prev => prev ? { ...prev, name: trimmed } : prev);
      setEditingName(false);
    } catch (err) {
      console.error('Failed to update name:', err);
    } finally {
      setSavingName(false);
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

        {editingName ? (
          <View style={styles.editNameRow}>
            <TextInput
              style={styles.editNameInput}
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
              placeholder="Enter name"
              placeholderTextColor="rgba(255,255,255,0.3)"
              onSubmitEditing={saveName}
              returnKeyType="done"
              editable={!savingName}
            />
            <TouchableOpacity onPress={saveName} disabled={savingName || !nameInput.trim()} style={styles.editNameSave}>
              <Text style={styles.editNameSaveText}>{savingName ? '...' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditingName(false)} style={styles.editNameCancel}>
              <Text style={styles.editNameCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              if (friendStatus === 'self') {
                setNameInput(profile.name);
                setEditingName(true);
              }
            }}
            disabled={friendStatus !== 'self'}
          >
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.name || 'Set your name'}</Text>
              {friendStatus === 'self' && <Text style={styles.editHint}>tap to edit</Text>}
            </View>
          </TouchableOpacity>
        )}
        <Text style={styles.email}>{profile.email}</Text>

        {friendStatus === 'friends' && (
          <View style={[styles.friendButton, styles.friendButtonFriends]}>
            <Text style={styles.friendButtonTextFriends}>Friends</Text>
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
              {(profile.snipesMade / Math.max(1, profile.snipesReceived)).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Ratio</Text>
          </View>
        </View>

        {profile.snipesMade === 0 && profile.snipesReceived === 0 && (
          <View style={styles.emptySnipes}>
            <Text style={styles.emptySnipesText}>
              No snipes yet — still lurking in the shadows...
            </Text>
          </View>
        )}

        {profile.recentSnipeUrls.length > 0 && (
          <View style={styles.gridSection}>
            <Text style={styles.gridTitle}>Recent Snipes</Text>
            <View style={styles.grid}>
              {profile.recentSnipeUrls.map((url, i) => (
                <Image key={i} source={{ uri: url }} style={styles.gridImage} />
              ))}
            </View>
          </View>
        )}

        {profile.topSnipers.length > 0 && (
          <View style={[styles.gridSection, { marginTop: 8 }]}>
            <Text style={styles.gridTitle}>Personal Leaderboard (Sniped By)</Text>
            <View style={{ backgroundColor: '#15151B', borderRadius: 16, overflow: 'hidden' }}>
              {profile.topSnipers.map((item, index) => (
                <View key={item.user.id} style={styles.topSniperRow}>
                  <Text style={styles.topSniperRank}>#{index + 1}</Text>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.topSniperName} numberOfLines={1}>{item.user.name}</Text>
                  </View>
                  <View style={styles.topSniperScoreBadge}>
                    <Text style={styles.topSniperScore}>{item.score}</Text>
                  </View>
                </View>
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
  nameRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  editHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    marginTop: 2,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    width: '100%',
    justifyContent: 'center',
  },
  editNameInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    minWidth: 160,
    textAlign: 'center',
  },
  editNameSave: {
    backgroundColor: '#34C759',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  editNameSaveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  editNameCancel: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  editNameCancelText: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    fontSize: 14,
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
  topSniperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  topSniperRank: {
    color: '#FF3B30',
    fontWeight: '800',
    fontSize: 16,
    width: 32,
  },
  topSniperName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  topSniperScoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  topSniperScore: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
