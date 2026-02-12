import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { type Schema } from "@/amplify/data/resource";
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export default function FriendsScreen() {
    const [searchQuery, setSearchQuery] = useState('');

    const [nonFriends, setNonFriends] = useState<Schema['UserProfile']['type'][]>([]);
    const [friends, setFriends] = useState<Schema['UserProfile']['type'][]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        async function getFriendsAndUser() {
            const { data: users } = await client.models.UserProfile.list();

            const { userId } = await getCurrentUser();
            setUserId(userId);

            const { data: friendshipRecords } = await client.models.Friendship.list();
            const friendIds = new Set(friendshipRecords.map(f => f.friendId));

            const { data: allUsers } = await client.models.UserProfile.list();
            const otherUsers = allUsers.filter(u => u.id !== userId);
            setFriends(otherUsers);

            const friends: Schema['UserProfile']['type'][] = [];
            const nonFriends: Schema['UserProfile']['type'][] = [];

            allUsers.forEach(user => {
                if (user.id === userId) return;

                if (friendIds.has(user.id)) {
                    friends.push(user);
                } else {
                    nonFriends.push(user);
                }
            });

            setFriends(friends);
            setNonFriends(nonFriends);
        }
        getFriendsAndUser();
    }, []);

    const addFriend = async (userToAdd: Schema['UserProfile']['type']) => {
        if (!userId) return;
        await client.models.Friendship.create({
            userId: userId,
            friendId: userToAdd.id
        });
        setNonFriends(prev => prev.filter(u => u.id !== userToAdd.id));
        setFriends(prev => [...prev, userToAdd]);
    };

    const isSearching = searchQuery.length > 0;

    const displayedData = isSearching
        ? nonFriends.filter(u => u.email.includes(searchQuery.toLowerCase()))
        : friends;

    // return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Friends</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Add friend by contact"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#888"
                />
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={displayedData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.friendItem}>
                        <View style={styles.avatarPlaceholder} />
                        <View>
                            <Text style={styles.friendName}>{item.name}</Text>
                            <Text style={styles.friendEmail}>{item.email}</Text>
                        </View>
                    </View>
                )}
                style={styles.list}
            />
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
        marginRight: 10,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#000',
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
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
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ddd',
        marginRight: 15,
    },
    friendName: {
        fontSize: 18,
        fontWeight: '600',
    },
    friendEmail: {
        color: '#666',
    },
});
