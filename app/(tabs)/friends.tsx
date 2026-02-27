import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { type Schema } from "@/amplify/data/resource";
import { usePendingRequests } from '@/context/PendingRequestsContext';
import { getCachedUrl } from '@/utils/url-cache';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

const UserAvatar = ({ path }: { path: string | null }) => {
    const [uri, setUri] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (!path) {
            setUri(null);
            return;
        }
        if (path.startsWith('http')) {
            setUri(path);
            return;
        }
        getCachedUrl(path).then(url => {
            if (!cancelled) setUri(url);
        });
        return () => { cancelled = true; };
    }, [path]);

    if (!uri) return <View style={styles.avatarPlaceholder} />;

    return <Image source={{ uri }} style={styles.avatarImage} />;
};

export default function FriendsScreen() {
    const { setPendingCount } = usePendingRequests();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests'>('friends');

    const [nonFriends, setNonFriends] = useState<Schema['UserProfile']['type'][]>([]);
    const [friends, setFriends] = useState<Schema['UserProfile']['type'][]>([]);
    const [incomingRequests, setIncomingRequests] = useState<Schema['FriendRequest']['type'][]>([]);
    const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());
    const [userId, setUserId] = useState<string | null>(null);

    const [allUsersMap, setAllUsersMap] = useState<Map<string, Schema['UserProfile']['type']>>(new Map());

    useFocusEffect(
        useCallback(() => {
            async function getFriendsAndUser() {
                const [attributes, { data: users }, { data: friendshipRecords }, { data: requestRecords }] =
                    await Promise.all([
                        fetchUserAttributes(),
                        client.models.UserProfile.list(),
                        client.models.Friendship.list(),
                        client.models.FriendRequest.list(),
                    ]);

                const currentEmail = attributes.email;
                const currentUserProfile = users.find(u => u.email === currentEmail);
                const currentUserId = currentUserProfile ? currentUserProfile.id : null;
                if (currentUserId) {
                    setUserId(currentUserId);
                }

                const map = new Map<string, Schema['UserProfile']['type']>();
                users.forEach(u => map.set(u.id, u));
                setAllUsersMap(map);

                const friendIds = new Set(
                    friendshipRecords
                        .filter(f => f.userId === currentUserId)
                        .map(f => f.friendId)
                );

                const incoming = requestRecords.filter(r => r.receiverId === currentUserId);
                const outgoing = requestRecords.filter(r => r.senderId === currentUserId);
                const outgoingReceiverIds = new Set(outgoing.map(r => r.receiverId));

                const friendsList: Schema['UserProfile']['type'][] = [];
                const nonFriendsList: Schema['UserProfile']['type'][] = [];

                users.forEach(user => {
                    if (!user) return;
                    if (user.id === currentUserId) return;

                    if (friendIds.has(user.id)) {
                        friendsList.push(user);
                    } else {
                        nonFriendsList.push(user);
                    }
                });

                setFriends(friendsList);
                setNonFriends(nonFriendsList);
                setIncomingRequests(incoming);
                setSentRequestIds(outgoingReceiverIds);
                setPendingCount(incoming.length);
            }
            getFriendsAndUser();
        }, [])
    );

    const sendRequest = async (userToAdd: Schema['UserProfile']['type']) => {
        if (!userId) return;
        await client.models.FriendRequest.create({
            senderId: userId,
            receiverId: userToAdd.id
        });
        setSentRequestIds(prev => new Set(prev).add(userToAdd.id));
    };

    const acceptRequest = async (request: Schema['FriendRequest']['type']) => {
        if (!userId) return;

        await client.models.Friendship.create({
            userId: userId,
            friendId: request.senderId
        });
        await client.models.Friendship.create({
            userId: request.senderId,
            friendId: userId
        });

        await client.models.FriendRequest.delete({ id: request.id });

        setIncomingRequests(prev => prev.filter(r => r.id !== request.id));
        setPendingCount(Math.max(0, incomingRequests.length - 1));

        const acceptedUser = allUsersMap.get(request.senderId);
        if (acceptedUser) {
            setFriends(prev => [...prev, acceptedUser]);
            setNonFriends(prev => prev.filter(u => u.id !== request.senderId));
        }
    };

    const rejectRequest = async (request: Schema['FriendRequest']['type']) => {
        await client.models.FriendRequest.delete({ id: request.id });
        setIncomingRequests(prev => prev.filter(r => r.id !== request.id));
        setPendingCount(Math.max(0, incomingRequests.length - 1));
    };

    const removeFriend = async (friend: Schema['UserProfile']['type']) => {
        if (!userId) return;

        const { data: allFriendships } = await client.models.Friendship.list();
        const toDelete = allFriendships.filter(
            f =>
                (f.userId === userId && f.friendId === friend.id) ||
                (f.userId === friend.id && f.friendId === userId)
        );
        await Promise.all(toDelete.map(f => client.models.Friendship.delete({ id: f.id })));

        setFriends(prev => prev.filter(u => u.id !== friend.id));
        setNonFriends(prev => [...prev, friend]);
    };

    const isSearching = activeTab === 'search' && searchQuery.length > 0;

    const displayedFriendsData = friends;
    const displayedSearchData = isSearching
        ? nonFriends.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    const renderFriendOrUserItem = ({ item }: { item: Schema['UserProfile']['type'] }) => {
        const hasSentRequest = sentRequestIds.has(item.id);

        return (
            <View style={styles.friendItem}>
                <UserAvatar path={item.profilePicture || null} />
                <View style={styles.userInfo}>
                    <Text style={styles.friendName}>{item.name}</Text>
                    <Text style={styles.friendEmail}>{item.email}</Text>
                </View>
                {activeTab === 'friends' && (
                    <TouchableOpacity
                        onPress={() => removeFriend(item)}
                        style={[styles.actionButton, styles.unfriendButton]}
                    >
                        <Text style={styles.actionButtonText}>Unfriend</Text>
                    </TouchableOpacity>
                )}
                {activeTab === 'search' && (
                    <TouchableOpacity
                        onPress={() => hasSentRequest ? null : sendRequest(item)}
                        style={[styles.actionButton, hasSentRequest && styles.disabledButton]}
                        disabled={hasSentRequest}
                    >
                        <Text style={styles.actionButtonText}>
                            {hasSentRequest ? 'Sent' : 'Add'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderRequestItem = ({ item }: { item: Schema['FriendRequest']['type'] }) => {
        const sender = allUsersMap.get(item.senderId);
        if (!sender) return null;

        return (
            <View style={styles.friendItem}>
                <UserAvatar path={sender.profilePicture || null} />
                <View style={styles.userInfo}>
                    <Text style={styles.friendName}>{sender.name}</Text>
                    <Text style={styles.friendEmail}>{sender.email}</Text>
                </View>
                <View style={styles.requestActions}>
                    <TouchableOpacity onPress={() => acceptRequest(item)} style={[styles.actionButton, styles.acceptButton]}>
                        <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => rejectRequest(item)} style={[styles.actionButton, styles.rejectButton]}>
                        <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>FRIENDS</Text>

            <View style={styles.tabContainer}>
                {(['friends', 'search', 'requests'] as const).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={styles.tab}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab === 'friends' ? 'MY FRIENDS' : tab === 'search' ? 'ADD' : `REQUESTS${incomingRequests.length > 0 ? ` (${incomingRequests.length})` : ''}`}
                        </Text>
                        {activeTab === tab && <View style={styles.tabUnderline} />}
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.tabDivider} />

            {activeTab === 'search' && (
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for users..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="rgba(255,255,255,0.35)"
                    />
                </View>
            )}

            {activeTab === 'friends' && (
                <FlatList
                    data={displayedFriendsData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderFriendOrUserItem}
                    style={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>You have no friends yet.</Text>}
                />
            )}

            {activeTab === 'search' && (
                <FlatList
                    data={displayedSearchData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderFriendOrUserItem}
                    style={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>{searchQuery.length > 0 ? 'No users found.' : 'Type a name or email to search.'}</Text>}
                />
            )}

            {activeTab === 'requests' && (
                <FlatList
                    data={incomingRequests}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRequestItem}
                    style={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No pending friend requests.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0B0F',
        paddingHorizontal: 20,
        paddingTop: 64,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
        marginBottom: 14,
    },
    tabContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    tab: {
        paddingBottom: 10,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.2,
        color: 'rgba(255,255,255,0.4)',
    },
    activeTabText: {
        color: '#fff',
    },
    tabUnderline: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(255,59,48,0.9)',
        borderRadius: 1,
    },
    tabDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: 8,
    },
    searchContainer: {
        marginVertical: 12,
    },
    searchInput: {
        height: 46,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        paddingHorizontal: 18,
        fontSize: 16,
        color: '#fff',
    },
    list: {
        flex: 1,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    userInfo: {
        flex: 1,
    },
    avatarPlaceholder: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginRight: 14,
    },
    avatarImage: {
        width: 46,
        height: 46,
        borderRadius: 23,
        marginRight: 14,
    },
    friendName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    friendEmail: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        marginTop: 2,
    },
    actionButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginLeft: 8,
    },
    disabledButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    acceptButton: {
        backgroundColor: '#34C759',
    },
    rejectButton: {
        backgroundColor: 'rgba(255,59,48,0.9)',
    },
    unfriendButton: {
        backgroundColor: 'rgba(255,59,48,0.9)',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    requestActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.4)',
        marginTop: 40,
        fontSize: 15,
    },
});
