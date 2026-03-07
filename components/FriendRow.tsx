import { getCachedUrl } from '@/utils/url-cache';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface User {
    id: string;
    name: string;
    profilePicture?: string | null;
}

interface FriendRowProps {
    user: User;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    isActive?: boolean;
}

export function FriendRow({ user, onPress, rightElement, isActive }: FriendRowProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        if (user.profilePicture) {
            getCachedUrl(user.profilePicture).then(url => {
                if (active) setAvatarUrl(url);
            });
        } else {
            setAvatarUrl(null);
        }
        return () => { active = false; };
    }, [user.profilePicture]);

    const inner = (
        <View style={[styles.container, isActive && styles.activeContainer]}>
            <View style={styles.left}>
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>{user.name.charAt(0).toUpperCase()}</Text>
                    </View>
                )}
                <Text style={styles.nameText} numberOfLines={1}>{user.name}</Text>
            </View>
            <View style={styles.right}>
                {rightElement}
            </View>
        </View>
    );

    if (onPress) {
        return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{inner}</TouchableOpacity>;
    }
    return inner;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#1E1E24',
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeContainer: {
        borderColor: '#fff',
        backgroundColor: '#2A2A30',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarInitial: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    nameText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        flexShrink: 1,
    },
    right: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    }
});
