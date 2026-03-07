import type { Schema } from '@/amplify/data/resource';
import { FriendRow } from '@/components/FriendRow';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { uploadData } from 'aws-amplify/storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Button,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';

const client = generateClient<Schema>();

// ─── Crosshair overlay ───────────────────────────────────────────────────────

function Crosshair() {
    return (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {/* Horizontal left arm */}
            <View style={[styles.crossLine, { top: '50%', right: '50%', marginTop: -0.75, marginRight: 10, width: 36, height: 1.5 }]} />
            {/* Horizontal right arm */}
            <View style={[styles.crossLine, { top: '50%', left: '50%', marginTop: -0.75, marginLeft: 10, width: 36, height: 1.5 }]} />
            {/* Vertical top arm */}
            <View style={[styles.crossLine, { left: '50%', bottom: '50%', marginLeft: -0.75, marginBottom: 10, width: 1.5, height: 36 }]} />
            {/* Vertical bottom arm */}
            <View style={[styles.crossLine, { left: '50%', top: '50%', marginLeft: -0.75, marginTop: 10, width: 1.5, height: 36 }]} />
            {/* Center dot */}
            <View style={styles.crossDot} />
        </View>
    );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function SnipingScreen() {
    const isDark = useColorScheme() === 'dark';

    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [status, setStatus] = useState('');
    const [isSniping, setIsSniping] = useState(false);

    const [currentUserProfile, setCurrentUserProfile] = useState<{ id: string; name: string } | null>(null);
    const [friends, setFriends] = useState<{ id: string, name: string, profilePicture?: string | null }[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<{ id: string, name: string, profilePicture?: string | null } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [caption, setCaption] = useState('');

    // Spring animation for bottom sheet (no longer used for modal, but kept for potential future use)
    const sheetY = useSharedValue(600);
    const sheetAnimStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetY.value }],
    }));

    function openPicker() {
        setIsPickerVisible(true);
        // sheetY.value = 600; // No longer needed with animationType="slide"
        // sheetY.value = withSpring(0, { damping: 20, stiffness: 180 });
    }

    function closePicker() {
        // sheetY.value = withTiming(600, { duration: 220 }); // No longer needed
        // setTimeout(() => setIsPickerVisible(false), 220);
        setIsPickerVisible(false);
        setSearchQuery('');
    }

    useEffect(() => {
        async function loadFriends() {
            try {
                const [attrs, { data: allUsers }, { data: friendships }] = await Promise.all([
                    fetchUserAttributes(),
                    client.models.UserProfile.list(),
                    client.models.Friendship.list(),
                ]);

                const email = attrs.email;
                if (!email) {
                    setStatus('Could not load user — please sign in again.');
                    return;
                }

                const me = allUsers.find(u => u.email === email);
                if (!me) {
                    setStatus('No profile found. Please complete profile setup.');
                    return;
                }
                setCurrentUserProfile({ id: me.id, name: me.name });

                const userMap = new Map(allUsers.map(u => [u.id, u]));
                const myFriendships = friendships.filter(f => f.userId === me.id);

                setFriends(
                    myFriendships
                        .map(f => userMap.get(f.friendId))
                        .filter(Boolean)
                        .map(p => ({ id: p!.id, name: p!.name, profilePicture: p!.profilePicture }))
                );
            } catch (err) {
                console.error('Error loading friends:', err);
                setStatus('Error loading friends.');
            } finally {
                setLoadingFriends(false);
            }
        }
        loadFriends();
    }, []);

    const takePicture = async () => {
        if (!cameraRef.current) return;
        if (!currentUserProfile) { setStatus('Profile not loaded yet.'); return; }
        if (!selectedFriend) { setStatus('Select a target first!'); return; }

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        setIsSniping(true);
        setStatus('Sniping...');

        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false, exif: false });
            if (!photo?.uri) throw new Error('Failed to capture photo.');

            setStatus('Uploading...');
            const response = await fetch(photo.uri);
            const blob = await response.blob();
            const filename = `snipes/${Date.now()}.jpg`;

            await uploadData({ path: filename, data: blob }).result;

            const { data: newSnipe, errors } = await client.mutations.submitSnipe({
                targetId: selectedFriend.id,
                imageKey: filename,
                caption: caption.trim() || undefined,
            });

            if (errors) {
                console.error("Snipe creation error!", errors);
                throw new Error("Failed to create snipe");
            }

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setStatus('Snipe sent!');
            setCaption('');
            setSelectedFriend(null);
            setTimeout(() => { setStatus(''); setIsSniping(false); }, 3000);
        } catch (error) {
            console.error('Error sniping:', error);
            setStatus(`Error: ${(error as Error).message}`);
            setIsSniping(false);
        }
    };

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant permission" />
            </View>
        );
    }

    const isDisabled = isSniping || loadingFriends;

    return (
        <View style={styles.container}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back">
                {/* Crosshair reticle */}
                <Crosshair />

                <View style={styles.uiContainer}>
                    {/* Top bar: status + target lock badge */}
                    <View style={styles.topBar}>
                        {status ? (
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{status}</Text>
                            </View>
                        ) : null}

                        {selectedFriend && !status ? (
                            <View style={styles.targetBadge}>
                                <IconSymbol name="eye.fill" size={14} color="#fff" />
                                <View style={styles.targetBadgeAvatar}>
                                    <Text style={styles.targetBadgeInitial}>
                                        {selectedFriend.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.targetBadgeName} numberOfLines={1}>
                                    {selectedFriend.name}
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Bottom controls */}
                    <View style={styles.controlsContainer}>
                        <Pressable
                            style={styles.targetSelector}
                            onPress={openPicker}
                            disabled={loadingFriends}
                        >
                            <Text style={styles.targetSelectorText}>
                                {loadingFriends
                                    ? 'Loading friends...'
                                    : selectedFriend
                                        ? `${selectedFriend.name} ▾`
                                        : 'Tap to select target ▾'}
                            </Text>
                        </Pressable>

                        <TextInput
                            style={styles.captionInput}
                            placeholder="Add a caption (optional)"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={caption}
                            onChangeText={setCaption}
                            maxLength={120}
                            returnKeyType="done"
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, isDisabled && styles.buttonDisabled]}
                                onPress={takePicture}
                                disabled={isDisabled}
                            >
                                {isSniping ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Snip!</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </CameraView>

            {/* Friend Picker Modal */}
            <Modal visible={isPickerVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalSheet, isDark && styles.modalSheetDark, { height: '80%' }]}>
                        <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Select Target</Text>

                        <TextInput
                            style={[
                                styles.captionInput,
                                { marginBottom: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: isDark ? '#fff' : '#000' }
                            ]}
                            placeholder="Search friends..."
                            placeholderTextColor={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)"}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />

                        {loadingFriends ? <ActivityIndicator size="small" /> : (
                            <FlatList
                                data={friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <View style={{ marginBottom: 8 }}>
                                        <FriendRow
                                            user={item}
                                            onPress={() => {
                                                setSelectedFriend(item);
                                                setIsPickerVisible(false);
                                                setSearchQuery('');
                                            }}
                                        />
                                    </View>
                                )}
                                ListEmptyComponent={<Text style={styles.emptyText}>No friends found.</Text>}
                            />
                        )}
                        <TouchableOpacity
                            style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                            onPress={() => {
                                setIsPickerVisible(false);
                                setSearchQuery('');
                            }}
                        >
                            <Text style={[styles.cancelText, isDark && styles.cancelTextDark]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center' },
    message: { textAlign: 'center', paddingBottom: 10 },
    camera: { flex: 1 },

    // Crosshair
    crossLine: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    crossDot: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 59, 48, 0.9)',
        top: '50%',
        left: '50%',
        marginTop: -3,
        marginLeft: -3,
    },

    // Camera UI
    uiContainer: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    topBar: {
        marginTop: 50,
        alignItems: 'center',
        gap: 10,
    },
    statusBadge: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    statusText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },

    // Target lock badge
    targetBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.85)',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        gap: 8,
        maxWidth: '70%',
    },
    targetLockIcon: { marginRight: 4 },
    targetBadgeAvatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    targetBadgeInitial: { color: '#fff', fontWeight: '700', fontSize: 13 },
    targetBadgeName: { color: '#fff', fontWeight: '700', fontSize: 14, flexShrink: 1 },

    // Bottom controls
    controlsContainer: { gap: 12, marginBottom: 20 },
    targetSelector: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    targetSelectorText: { color: 'white', fontSize: 16, fontWeight: '600' },
    captionInput: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: 12,
        borderRadius: 12,
        fontSize: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    button: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.85)',
        padding: 20,
        borderRadius: 50,
        width: 100,
        height: 100,
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: 'white',
    },
    buttonDisabled: { backgroundColor: 'rgba(100, 100, 100, 0.8)' },
    buttonText: { fontSize: 18, fontWeight: 'bold', color: 'white' },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '60%',
    },
    modalSheetDark: { backgroundColor: '#1c1c1e' },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#111',
    },
    modalTitleDark: { color: '#f0f0f0' },
    emptyText: { textAlign: 'center', color: '#888', marginVertical: 20 },
    friendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
        gap: 12,
    },
    friendRowDark: { borderBottomColor: '#333' },
    friendRowAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,59,48,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    friendRowInitial: { fontWeight: '700', fontSize: 15, color: '#FF3B30' },
    friendName: { fontSize: 16, color: '#111' },
    friendNameDark: { color: '#f0f0f0' },
    cancelButton: {
        marginTop: 16,
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f2f2f2',
        borderRadius: 12,
    },
    cancelButtonDark: { backgroundColor: '#2c2c2e' },
    cancelText: { fontSize: 16, fontWeight: '600', color: '#333' },
    cancelTextDark: { color: '#f0f0f0' },
});
