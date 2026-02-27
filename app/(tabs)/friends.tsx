import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { type Schema } from "@/amplify/data/resource";
import { usePendingRequests } from '@/context/PendingRequestsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from "aws-amplify/data";
import { getUrl } from 'aws-amplify/storage';

const client = generateClient<Schema>();

const UserAvatar = ({ path }: { path: string | null }) => {
    const [uri, setUri] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (!path) {
            setUri(null);
            return;
        }
        async function fetchImage() {
            if (!path) return;
            if (path.startsWith('http')) {
                if (!cancelled) setUri(path);
                return;
            }
            const result = await getUrl({ path });
            if (!cancelled) setUri(result.url.toString());
        }
        fetchImage();
        return () => { cancelled = true; };
    }, [path]);

    if (!uri) return <View style={styles.avatarPlaceholder} />;

    return <Image source={{ uri }} style={styles.avatarImage} />;
};

export default function FriendsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setPendingCount } = usePendingRequests();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests'>('friends');

    const [nonFriends, setNonFriends] = useState<Schema['UserProfile']['type'][]>([]);
    const [friends, setFriends] = useState<Schema['UserProfile']['type'][]>([]);
    const [incomingRequests, setIncomingRequests] = useState<Schema['FriendRequest']['type'][]>([]);
    const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());
    const [userId, setUserId] = useState<string | null>(null);

    // To help lookup users quickly
    const [allUsersMap, setAllUsersMap] = useState<Map<string, Schema['UserProfile']['type']>>(new Map());

    useFocusEffect(
        useCallback(() => {
            async function getFriendsAndUser() {
                const attributes = await fetchUserAttributes();
                const currentEmail = attributes.email;

                const { data: users } = await client.models.UserProfile.list();
                const currentUserProfile = users.find(u => u.email === currentEmail);
                const currentUserId = currentUserProfile ? currentUserProfile.id : null;
                if (currentUserId) {
                    setUserId(currentUserId);
                }

                const map = new Map<string, Schema['UserProfile']['type']>();
                users.forEach(u => map.set(u.id, u));
                setAllUsersMap(map);

                const { data: friendshipRecords } = await client.models.Friendship.list();
                const friendIds = new Set(
                    friendshipRecords
                        .filter(f => f.userId === currentUserId)
                        .map(f => f.friendId)
                );

                const { data: requestRecords } = await client.models.FriendRequest.list();
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
            <View style={styles.header}>
                <Text style={styles.title}>Friends</Text>
            </View>

            <View style={[styles.tabContainer, isDark && styles.tabContainerDark]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'friends' && (isDark ? styles.activeTabDark : styles.activeTab)]}
                    onPress={() => setActiveTab('friends')}
                >
                    <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>My Friends</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'search' && (isDark ? styles.activeTabDark : styles.activeTab)]}
                    onPress={() => setActiveTab('search')}
                >
                    <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Add Friends</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'requests' && (isDark ? styles.activeTabDark : styles.activeTab)]}
                    onPress={() => setActiveTab('requests')}
                >
                    <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
                        Requests {incomingRequests.length > 0 ? `(${incomingRequests.length})` : ''}
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'search' && (
                <View style={styles.searchContainer}>
                    <TextInput
                        style={[styles.searchInput, isDark && styles.searchInputDark]}
                        placeholder="Search for users..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#888"
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
                    ListEmptyComponent={<Text style={styles.emptyText}>{searchQuery.length > 0 ? 'No non-friends found.' : 'Type a name or email to search.'}</Text>}
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
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        color: '#111',
    },
    searchInputDark: {
        backgroundColor: '#1c1c1e',
        color: '#f0f0f0',
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        padding: 4,
    },
    tabContainerDark: {
        backgroundColor: '#1c1c1e',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 21,
    },
    activeTab: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    activeTabDark: {
        backgroundColor: '#2c2c2e',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
    },
    activeTabText: {
        color: '#000',
    },
    list: {
        flex: 1,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    userInfo: {
        flex: 1,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ddd',
        marginRight: 15,
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    friendName: {
        fontSize: 18,
        fontWeight: '600',
    },
    friendEmail: {
        color: '#666',
        fontSize: 14,
    },
    actionButton: {
        backgroundColor: '#000',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginLeft: 8,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    acceptButton: {
        backgroundColor: '#34C759',
    },
    rejectButton: {
        backgroundColor: '#FF3B30',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    requestActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        marginTop: 40,
        fontSize: 16,
    },
});
