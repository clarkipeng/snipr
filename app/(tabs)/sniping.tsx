import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage';
import type { Schema } from '@/amplify/data/resource';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
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

const client = generateClient<Schema>();

export default function SnipingScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [status, setStatus] = useState('');
    const [isSniping, setIsSniping] = useState(false);

    const [currentUserProfile, setCurrentUserProfile] = useState<{ id: string; name: string } | null>(null);
    const [friends, setFriends] = useState<{ id: string; name: string }[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<{ id: string; name: string } | null>(null);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [showPicker, setShowPicker] = useState(false);
    const [caption, setCaption] = useState('');

    useEffect(() => {
        async function loadFriends() {
            try {
                const attrs = await fetchUserAttributes();
                const email = attrs.email;
                if (!email) {
                    setStatus('Could not load user — please sign in again.');
                    return;
                }

                const { data: users } = await client.models.UserProfile.list({
                    filter: { email: { eq: email } },
                });
                const me = users[0];
                if (!me) {
                    setStatus('No profile found. Please complete profile setup.');
                    return;
                }
                setCurrentUserProfile({ id: me.id, name: me.name });

                const { data: friendships } = await client.models.Friendship.list({
                    filter: { userId: { eq: me.id } },
                });
                const profiles = await Promise.all(
                    friendships.map(f => client.models.UserProfile.get({ id: f.friendId }))
                );
                setFriends(
                    profiles
                        .map(r => r.data)
                        .filter(Boolean)
                        .map(p => ({ id: p!.id, name: p!.name }))
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

            await client.models.Snipe.create({
                sniperId: currentUserProfile.id,
                targetId: selectedFriend.id,
                imageKey: filename,
                caption: caption.trim() || undefined,
            });

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

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const isDisabled = isSniping || loadingFriends;

    return (
        <View style={styles.container}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back">
                <View style={styles.uiContainer}>
                    {status ? (
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{status}</Text>
                        </View>
                    ) : null}

                    <View style={styles.controlsContainer}>
                        {/* Target selector */}
                        <Pressable
                            style={styles.targetSelector}
                            onPress={() => setShowPicker(true)}
                            disabled={loadingFriends}
                        >
                            <Text style={styles.targetSelectorText}>
                                {loadingFriends
                                    ? 'Loading friends...'
                                    : selectedFriend
                                        ? `Target: ${selectedFriend.name} ▾`
                                        : 'Tap to select target ▾'}
                            </Text>
                        </Pressable>

                        {/* Caption input */}
                        <TextInput
                            style={styles.captionInput}
                            placeholder="Add a caption (optional)"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={caption}
                            onChangeText={setCaption}
                            maxLength={120}
                            returnKeyType="done"
                        />

                        {/* Shutter button */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, isDisabled && styles.buttonDisabled]}
                                onPress={takePicture}
                                disabled={isDisabled}
                            >
                                {isSniping ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.text}>Snip!</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </CameraView>

            {/* Friend picker modal */}
            <Modal
                visible={showPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPicker(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>Select Target</Text>
                        {friends.length === 0 ? (
                            <Text style={styles.emptyText}>No friends yet. Add some friends first!</Text>
                        ) : (
                            <FlatList
                                data={friends}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={styles.friendRow}
                                        onPress={() => {
                                            setSelectedFriend(item);
                                            setShowPicker(false);
                                        }}
                                    >
                                        <Text style={styles.friendName}>{item.name}</Text>
                                    </Pressable>
                                )}
                            />
                        )}
                        <Pressable style={styles.cancelButton} onPress={() => setShowPicker(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    uiContainer: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    statusBadge: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 20,
        alignSelf: 'center',
        marginTop: 50,
    },
    statusText: {
        color: 'white',
        fontWeight: 'bold',
    },
    controlsContainer: {
        gap: 12,
        marginBottom: 20,
    },
    targetSelector: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    targetSelectorText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    captionInput: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: 12,
        borderRadius: 12,
        fontSize: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        marginTop: 8,
    },
    button: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.8)',
        padding: 20,
        borderRadius: 50,
        width: 100,
        height: 100,
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: 'white',
    },
    buttonDisabled: {
        backgroundColor: 'rgba(100, 100, 100, 0.8)',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    // Modal styles
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
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        marginVertical: 20,
    },
    friendRow: {
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },
    friendName: {
        fontSize: 16,
    },
    cancelButton: {
        marginTop: 16,
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f2f2f2',
        borderRadius: 12,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});
