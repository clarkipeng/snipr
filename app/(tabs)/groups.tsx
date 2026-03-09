import type { Schema } from '@/amplify/data/resource';
import { FriendRow } from '@/components/FriendRow';
import { SnipeCard } from '@/components/SnipeCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getCachedUrl } from '@/utils/url-cache';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const client = generateClient<Schema>();

type FeedItem = {
  id: string;
  senderId: string;
  senderName: string;
  senderProfilePicture: string | null;
  content: string | null;
  isSystemMessage: boolean;
  createdAt: string;
  snipeData?: {
    snipeId: string;
    sniperName: string;
    targetName: string;
    sniperProfilePictureUrl: string | null;
    imageUrl: string | null;
    caption: string | null;
  };
};

type GroupLeaderboardItem = {
  userId: string;
  name: string;
  profilePicture?: string | null;
  score: number;
  dominations: string[];
};

export default function GroupsScreen() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Schema['Group']['type'][]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedGroup, setSelectedGroup] = useState<Schema['Group']['type'] | null>(null);
  const [groupMembers, setGroupMembers] = useState<(Schema['GroupMember']['type'] & { user?: any })[]>([]);
  const [groupFeed, setGroupFeed] = useState<FeedItem[]>([]);
  const [groupLeaderboard, setGroupLeaderboard] = useState<GroupLeaderboardItem[]>([]);
  const [groupUserMap, setGroupUserMap] = useState<Map<string, { id: string; name: string; email?: string }>>(new Map());

  // UI states
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'feed' | 'manage' | 'leaderboard'>('list');
  const [newGroupName, setNewGroupName] = useState('');
  const [createSearchQuery, setCreateSearchQuery] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());

  // Manage state
  const [friends, setFriends] = useState<Schema['UserProfile']['type'][]>([]);

  // Chat state
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  async function loadInitialData() {
    try {
      const attributes = await fetchUserAttributes();
      if (!attributes.email) return;

      const { data: users } = await client.models.UserProfile.list({
        filter: { email: { eq: attributes.email } }
      });
      const uid = users[0]?.id;
      if (!uid) return;

      setCurrentUserId(uid);

      const { data: memberships } = await client.models.GroupMember.list({
        filter: { userId: { eq: uid } },
        selectionSet: ['id', 'group.*']
      });

      const userGroups = memberships
        .map(m => m.group as Schema['Group']['type'])
        .filter(g => g !== null);

      setGroups(userGroups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (viewMode === 'list') {
        loadInitialData();
      }
    }, [viewMode])
  );

  async function loadFriendsData() {
    if (!currentUserId) return;
    const { data: friendships } = await client.models.Friendship.list({
      filter: { userId: { eq: currentUserId } }
    });

    const friendIds = new Set(friendships.map(f => f.friendId));
    const { data: allUsers } = await client.models.UserProfile.list();

    const matchedFriends = allUsers
      .filter(u => friendIds.has(u.id))
      .map(u => ({ id: u.id, name: u.name, profilePicture: u.profilePicture }));

    setFriends(matchedFriends as any);
  }

  async function openCreate() {
    setNewGroupName('');
    setCreateSearchQuery('');
    setSelectedFriendIds(new Set());
    setViewMode('create');
    setLoading(true);
    try {
      await loadFriendsData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim() || !currentUserId) return;
    try {
      setLoading(true);
      const { data: newGroup } = await client.models.Group.create({
        name: newGroupName,
        createdBy: currentUserId,
      });
      if (newGroup) {
        const promises = [
          client.models.GroupMember.create({
            groupId: newGroup.id,
            userId: currentUserId
          })
        ];

        selectedFriendIds.forEach(id => {
          promises.push(
            client.models.GroupMember.create({
              groupId: newGroup.id,
              userId: id
            })
          );
        });

        await Promise.all(promises);

        setNewGroupName('');
        setCreateSearchQuery('');
        setSelectedFriendIds(new Set());
        setViewMode('list');
        await loadInitialData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function openGroup(group: Schema['Group']['type']) {
    setSelectedGroup(group);
    setViewMode('feed');
    await loadGroupData(group.id);
  }

  async function loadGroupData(groupId: string) {
    setLoading(true);
    try {
      // Fetch members and snipes
      const [{ data: memberships }, { data: allSnipes }, { data: allMessages }, { data: allUsers }] = await Promise.all([
        client.models.GroupMember.list({
          filter: { groupId: { eq: groupId } },
          limit: 1000
        }),
        client.models.Snipe.list({ limit: 1000 }),
        client.models.Message.list({
          filter: { groupId: { eq: groupId } },
          limit: 1000
        }),
        client.models.UserProfile.list({ limit: 1000 })
      ]);

      const userMap = new Map(allUsers.map(u => [u.id, { id: u.id, name: u.name, profilePicture: u.profilePicture }]));
      setGroupUserMap(new Map(allUsers.map(u => [u.id, { id: u.id, name: u.name, email: u.email }])));

      const enrichedMembers = memberships.map(m => ({
        id: m.id,
        groupId: m.groupId,
        userId: m.userId,
        user: userMap.get(m.userId)
      }));

      setGroupMembers(enrichedMembers as any);

      // We still need group snipes to calculate dominations
      const memberUserIds = new Set(memberships.map(m => m.userId));
      const groupSnipes = allSnipes.filter(s => memberUserIds.has(s.sniperId) && memberUserIds.has(s.targetId));

      const sortedMessages = [...allMessages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const items: FeedItem[] = await Promise.all(
        sortedMessages.map(async (msg) => {
          const sender = userMap.get(msg.senderId);
          const profilePicPath = sender?.profilePicture;
          const senderProfilePicture = profilePicPath ? await getCachedUrl(profilePicPath) : null;

          let snipeData = undefined;
          if (msg.snipeId) {
            const snipe = allSnipes.find(s => s.id === msg.snipeId);
            if (snipe) {
              const sniper = userMap.get(snipe.sniperId);
              const target = userMap.get(snipe.targetId);
              const sniperProfilePictureUrl = sniper?.profilePicture ? await getCachedUrl(sniper?.profilePicture) : null;
              const imageUrl = await getCachedUrl(snipe.imageKey);

              snipeData = {
                snipeId: snipe.id,
                sniperName: sniper?.name ?? 'Unknown',
                targetName: target?.name ?? 'Unknown',
                sniperProfilePictureUrl,
                imageUrl,
                caption: snipe.caption ?? null
              };
            }
          }

          return {
            id: msg.id,
            senderId: msg.senderId,
            senderName: sender?.name ?? 'Unknown',
            senderProfilePicture,
            content: msg.content ?? null,
            isSystemMessage: msg.isSystemMessage ?? false,
            createdAt: msg.createdAt,
            snipeData
          };
        })
      );

      setGroupFeed(items.reverse());

      // --- Calculate Leaderboard and Dominations ---
      const chronSnipes = [...groupSnipes].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      const scores = new Map<string, number>();
      const streaks = new Map<string, Map<string, number>>();

      enrichedMembers.forEach(m => {
        scores.set(m.userId, 0);
        streaks.set(m.userId, new Map());
      });

      chronSnipes.forEach(s => {
        scores.set(s.sniperId, (scores.get(s.sniperId) || 0) + 1);
        if (!streaks.has(s.sniperId)) streaks.set(s.sniperId, new Map());
        if (!streaks.has(s.targetId)) streaks.set(s.targetId, new Map());

        const currentStreak = streaks.get(s.sniperId)!.get(s.targetId) || 0;
        streaks.get(s.sniperId)!.set(s.targetId, currentStreak + 1);
        streaks.get(s.targetId)!.set(s.sniperId, 0); // Reset victim's streak against sniper
      });

      const leaderboard: GroupLeaderboardItem[] = enrichedMembers.map(m => {
        const doms: string[] = [];
        const myStreaks = streaks.get(m.userId);
        if (myStreaks) {
          for (const [targetId, streakCount] of myStreaks.entries()) {
            if (streakCount >= 3) {
              const targetName = userMap.get(targetId)?.name || 'Unknown';
              doms.push(targetName);
            }
          }
        }
        return {
          userId: m.userId,
          name: m.user?.name || 'Unknown',
          profilePicture: m.user?.profilePicture,
          score: scores.get(m.userId) || 0,
          dominations: doms
        };
      }).sort((a, b) => b.score - a.score);

      setGroupLeaderboard(leaderboard);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!messageInput.trim() || !currentUserId || !selectedGroup) return;
    setSendingMessage(true);
    try {
      await client.models.Message.create({
        groupId: selectedGroup.id,
        senderId: currentUserId,
        content: messageInput.trim(),
        isSystemMessage: false
      });
      setMessageInput('');
      await loadGroupData(selectedGroup.id);
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMessage(false);
    }
  }

  async function openManage() {
    setViewMode('manage');
    setLoading(true);
    try {
      await loadFriendsData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function addToGroup(userId: string) {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      await client.models.GroupMember.create({
        groupId: selectedGroup.id,
        userId: userId
      });
      await loadGroupData(selectedGroup.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromGroup(memberId: string) {
    setLoading(true);
    try {
      await client.models.GroupMember.delete({ id: memberId });
      if (selectedGroup) await loadGroupData(selectedGroup.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteGroup() {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      await client.models.Group.delete({ id: selectedGroup.id });
      setViewMode('list');
      await loadInitialData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (viewMode === 'list') {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>YOUR GROUPS</Text>
          <TouchableOpacity style={styles.btnSmall} onPress={openCreate}>
            <Text style={styles.btnSmallText}>+ Create</Text>
          </TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator style={{ marginTop: 20 }} color="#fff" /> : (
          <FlatList
            data={groups}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => openGroup(item)}>
                <Text style={styles.cardTitle}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>You are not in any groups yet.</Text>}
          />
        )}
      </View>
    );
  }

  if (viewMode === 'create') {
    const filteredFriends = friends.filter(friend =>
      friend.name.toLowerCase().includes(createSearchQuery.toLowerCase())
    );

    const toggleFriendSelection = (friendId: string) => {
      setSelectedFriendIds(prev => {
        const next = new Set(prev);
        if (next.has(friendId)) {
          next.delete(friendId);
        } else {
          next.add(friendId);
        }
        return next;
      });
    };

    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setViewMode('list')}>
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.header}>NEW GROUP</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={{ padding: 20, flex: 1 }}>
          <TextInput
            style={styles.input}
            placeholder="Name your squad"
            placeholderTextColor="#aaa"
            value={newGroupName}
            onChangeText={setNewGroupName}
          />

          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10 }}>Add Friends</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor="#888"
            value={createSearchQuery}
            onChangeText={setCreateSearchQuery}
          />

          {loading ? <ActivityIndicator style={{ marginTop: 20 }} color="#fff" /> : (
            <FlatList
              data={filteredFriends}
              keyExtractor={item => item.id}
              style={{ flex: 1, marginBottom: 20 }}
              renderItem={({ item }) => {
                const isSelected = selectedFriendIds.has(item.id);
                return (
                  <FriendRow
                    user={{ id: item.id, name: item.name, profilePicture: item.profilePicture }}
                    isActive={isSelected}
                    onPress={() => toggleFriendSelection(item.id)}
                    rightElement={
                      <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                        {isSelected && <IconSymbol name="checkmark" size={14} color="#0B0B0F" />}
                      </View>
                    }
                  />
                );
              }}
              ListEmptyComponent={<Text style={styles.emptyText}>No friends found.</Text>}
            />
          )}

          <TouchableOpacity
            style={[styles.btnPrimary, (!newGroupName.trim() || loading) && { opacity: 0.5 }]}
            onPress={handleCreateGroup}
            disabled={!newGroupName.trim() || loading}
          >
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnPrimaryText}>Create Group ({selectedFriendIds.size + 1})</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (viewMode === 'feed') {
    return (
      <View style={styles.container}>
        <View style={[styles.headerRow, { paddingHorizontal: 16 }]}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', width: 80, height: 40, justifyContent: 'flex-start' }}
            onPress={() => setViewMode('list')}
          >
            <IconSymbol name="chevron.left" size={28} color="#fff" />
          </TouchableOpacity>

          <Text
            style={[styles.header, { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center', letterSpacing: 0 }]}
            numberOfLines={1}
          >
            {selectedGroup?.name}
          </Text>

          <View style={{ width: 80, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
            <TouchableOpacity onPress={() => setViewMode('leaderboard')}>
              <IconSymbol name="trophy.fill" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openManage}>
              <IconSymbol name="gearshape.fill" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          {loading ? <ActivityIndicator style={{ marginTop: 20 }} color="#fff" /> : (
            <>
              <FlatList
                data={groupFeed}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                  const isMe = item.senderId === currentUserId;

                  if (item.isSystemMessage) {
                    return (
                      <View style={{ alignItems: 'center', marginVertical: 12 }}>
                        <Text style={{ color: '#FF3B30', fontSize: 13, fontWeight: 'bold' }}>{item.content}</Text>
                      </View>
                    );
                  }

                  if (item.snipeData) {
                    return (
                      <SnipeCard
                        snipeId={item.snipeData.snipeId}
                        sniperName={item.snipeData.sniperName}
                        targetName={item.snipeData.targetName}
                        sniperProfilePictureUrl={item.snipeData.sniperProfilePictureUrl}
                        imageUrl={item.snipeData.imageUrl}
                        caption={item.snipeData.caption}
                        createdAt={item.createdAt}
                        currentUserId={currentUserId}
                        userMap={groupUserMap}
                      />
                    );
                  }

                  return (
                    <View style={[styles.chatBubbleContainer, isMe ? styles.chatBubbleRight : styles.chatBubbleLeft]}>
                      {!isMe && (
                        <Text style={styles.chatSenderName}>{item.senderName}</Text>
                      )}
                      <View style={[styles.chatBubble, isMe ? styles.chatBubbleSelf : styles.chatBubbleOther]}>
                        <Text style={styles.chatText}>{item.content}</Text>
                      </View>
                    </View>
                  );
                }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={() => selectedGroup && loadGroupData(selectedGroup.id)} tintColor="#FF3B30" />}
              />
              {groupFeed.length === 0 && (
                <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }]}>
                  <Text style={[styles.emptyText, { textAlign: 'center' }]}>Feed is quiet.{"\n"}Send a message or a snipe!</Text>
                </View>
              )}
            </>
          )}

          {/* Chat Input */}
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInputBox}
              placeholder="Send a message..."
              placeholderTextColor="#888"
              value={messageInput}
              onChangeText={setMessageInput}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[styles.chatSendButton, !messageInput.trim() && { opacity: 0.5 }]}
              onPress={sendMessage}
              disabled={!messageInput.trim() || sendingMessage}
            >
              {sendingMessage ? <ActivityIndicator color="#fff" /> : <IconSymbol name="paperplane.fill" size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (viewMode === 'manage') {
    const memberIds = new Set(groupMembers.map(m => m.userId));

    // Filter friends by query and ensure they aren't already in the group
    const friendsNotInGroup = friends.filter(friend =>
      !memberIds.has(friend.id) &&
      friend.name.toLowerCase().includes(createSearchQuery.toLowerCase())
    );

    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setViewMode('feed')}>
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.header, { fontSize: 20, flex: 1, textAlign: 'center' }]}>Manage Group</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? <ActivityIndicator style={{ marginTop: 20 }} color="#fff" /> : (
          <View style={{ flex: 1 }}>
            <Text style={styles.subHeader}>Current Members</Text>
            <FlatList
              data={groupMembers}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <FriendRow
                  user={{ id: item.userId, name: item.user?.name || 'Unknown', profilePicture: item.user?.profilePicture }}
                  rightElement={
                    item.userId !== currentUserId ? (
                      <TouchableOpacity onPress={() => removeFromGroup(item.id)} style={styles.btnSmallDanger}>
                        <Text style={styles.btnSmallText}>Remove</Text>
                      </TouchableOpacity>
                    ) : undefined
                  }
                />
              )}
              style={{ flex: 0, maxHeight: 250, marginHorizontal: 16 }}
            />

            <Text style={styles.subHeader}>Add Friends</Text>
            <View style={{ paddingHorizontal: 16 }}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search friends..."
                placeholderTextColor="#888"
                value={createSearchQuery}
                onChangeText={setCreateSearchQuery}
              />
            </View>
            <FlatList
              data={friendsNotInGroup}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <FriendRow
                  user={{ id: item.id, name: item.name, profilePicture: item.profilePicture }}
                  rightElement={
                    <TouchableOpacity onPress={() => addToGroup(item.id)} style={styles.btnSmallWhite}>
                      <Text style={[styles.btnSmallText, { color: '#000' }]}>Add</Text>
                    </TouchableOpacity>
                  }
                />
              )}
              style={{ flex: 1, paddingHorizontal: 16 }}
              ListEmptyComponent={<Text style={styles.emptyText}>All friends are already in this group.</Text>}
            />

            {selectedGroup?.createdBy === currentUserId && (
              <TouchableOpacity onPress={deleteGroup} style={[styles.btnSmallDanger, { margin: 20, alignSelf: 'center', paddingHorizontal: 32, paddingVertical: 12 }]}>
                <Text style={[styles.btnSmallText, { fontSize: 16 }]}>Delete Group</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }

  if (viewMode === 'leaderboard') {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setViewMode('feed')}>
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.header, { fontSize: 20, flex: 1, textAlign: 'center' }]}>Leaderboard</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={{ flex: 1, padding: 16 }}>
          <View style={{ backgroundColor: '#15151B', borderRadius: 16, overflow: 'hidden' }}>
            {groupLeaderboard.map((item, index) => (
              <View key={item.userId} style={styles.topSniperRow}>
                <Text style={styles.topSniperRank}>#{index + 1}</Text>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.topSniperName} numberOfLines={1}>{item.name}</Text>
                  {item.dominations.length > 0 && (
                    <Text style={{ color: '#FF3B30', fontSize: 12, marginTop: 4, fontWeight: '600' }} numberOfLines={1}>
                      Dominating: {item.dominations.join(', ')}
                    </Text>
                  )}
                </View>
                <View style={styles.topSniperScoreBadge}>
                  <Text style={styles.topSniperScore}>{item.score}</Text>
                </View>
              </View>
            ))}
            {groupLeaderboard.length === 0 && (
              <Text style={{ color: '#888', textAlign: 'center', padding: 20 }}>No snipes yet.</Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#fff',
  },
  backBtn: {
    padding: 4,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)'
  },
  rowText: {
    color: '#fff',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1E1E24',
    padding: 20,
    borderRadius: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  btnSmall: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  btnSmallWhite: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  btnSmallDanger: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF3B30'
  },
  btnSmallText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: '#1E1E24',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#15151A',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  friendSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E1E24',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  friendSelectRowActive: {
    borderColor: '#fff',
    backgroundColor: '#2A2A30',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  btnPrimary: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
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
  chatBubbleContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  chatBubbleLeft: {
    alignSelf: 'flex-start',
  },
  chatBubbleRight: {
    alignSelf: 'flex-end',
  },
  chatBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  chatBubbleSelf: {
    backgroundColor: '#FF3B30',
    borderBottomRightRadius: 4,
  },
  chatBubbleOther: {
    backgroundColor: '#2A2A30',
    borderBottomLeftRadius: 4,
  },
  chatText: {
    color: '#fff',
    fontSize: 15,
  },
  chatSenderName: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 8,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 32, // safe area spacing roughly
    backgroundColor: '#15151B',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  chatInputBox: {
    flex: 1,
    backgroundColor: '#0B0B0F',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  chatSendButton: {
    backgroundColor: '#FF3B30',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
