import type { Schema } from '@/amplify/data/resource';
import { FriendRow } from '@/components/FriendRow';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { checkAndAwardBadges } from '@/utils/badge-checker';
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
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const client = generateClient<Schema>();

function Crosshair() {
    return (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View style={[styles.crossLine, { top: '50%', right: '50%', marginTop: -0.75, marginRight: 10, width: 36, height: 1.5 }]} />
            <View style={[styles.crossLine, { top: '50%', left: '50%', marginTop: -0.75, marginLeft: 10, width: 36, height: 1.5 }]} />
            <View style={[styles.crossLine, { left: '50%', bottom: '50%', marginLeft: -0.75, marginBottom: 10, width: 1.5, height: 36 }]} />
            <View style={[styles.crossLine, { left: '50%', top: '50%', marginLeft: -0.75, marginTop: 10, width: 1.5, height: 36 }]} />
            <View style={styles.crossDot} />
        </View>
    );
}

export default function SnipingScreen() {
    const isDark = useColorScheme() === 'dark';
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    const [currentUserProfile, setCurrentUserProfile] = useState<{ id: string; name: string } | null>(null);
    const [friends, setFriends] = useState<{ id: string; name: string; profilePicture?: string | null }[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(true);

    const [capturedUri, setCapturedUri] = useState<string | null>(null);
    const [selectedFriend, setSelectedFriend] = useState<{ id: string; name: string; profilePicture?: string | null } | null>(null);
    const [caption, setCaption] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        async function loadFriends() {
            try {
                const [attrs, { data: allUsers }, { data: friendships }] = await Promise.all([
                    fetchUserAttributes(),
                    client.models.UserProfile.list(),
                    client.models.Friendship.list(),
                ]);
                const email = attrs.email;
                if (!email) return;
                const me = allUsers.find(u => u.email === email);
                if (!me) return;
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
            } finally {
                setLoadingFriends(false);
            }
        }
        loadFriends();
    }, []);

    const capture = async () => {
        if (!cameraRef.current) return;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false, exif: false });
            if (photo?.uri) setCapturedUri(photo.uri);
        } catch (err) {
            console.error('Capture failed:', err);
        }
    };

    const submitSnipe = async () => {
        if (!capturedUri || !selectedFriend || !currentUserProfile) return;
        setSubmitting(true);
        setStatus('Uploading...');
        try {
            const response = await fetch(capturedUri);
            const blob = await response.blob();
            const filename = `snipes/${Date.now()}.jpg`;
            await uploadData({ path: filename, data: blob }).result;

            setStatus('Sending snipe...');
            const { errors } = await client.mutations.submitSnipe({
                targetId: selectedFriend.id,
                imageKey: filename,
                caption: caption.trim() || undefined,
            });
            if (errors) throw new Error('Failed to create snipe');

            // Check and award badges after successful snipe
            if (currentUserProfile?.id) {
                const newBadges = await checkAndAwardBadges(currentUserProfile.id);
                if (newBadges.length > 0) {
                    console.log('Earned new badges:', newBadges);
                }
            }

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setStatus('Snipe sent!');
            setTimeout(() => {
                setCapturedUri(null);
                setSelectedFriend(null);
                setCaption('');
                setStatus('');
            }, 1500);
        } catch (error) {
            console.error('Error sniping:', error);
            setStatus(`Error: ${(error as Error).message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const discardPhoto = () => {
        setCapturedUri(null);
        setSelectedFriend(null);
        setCaption('');
        setStatus('');
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

    // Phase 2: Photo captured — show review + target/caption form
    if (capturedUri) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                <View style={styles.reviewOverlay}>
                    {status ? (
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{status}</Text>
                        </View>
                    ) : null}

                    <View style={styles.reviewForm}>
                        <Pressable style={styles.targetSelector} onPress={() => setIsPickerVisible(true)}>
                            <Text style={styles.targetSelectorText}>
                                {selectedFriend ? `Target: ${selectedFriend.name} ▾` : 'Select target ▾'}
                            </Text>
                        </Pressable>

                        <TextInput
                            style={styles.captionInput}
                            placeholder="Add a caption (optional)"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={caption}
                            onChangeText={setCaption}
                            maxLength={120}
                            returnKeyType="done"
                        />

                        <View style={styles.reviewActions}>
                            <TouchableOpacity style={styles.discardButton} onPress={discardPhoto} disabled={submitting}>
                                <Text style={styles.discardText}>Retake</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sendButton, (!selectedFriend || submitting) && styles.sendButtonDisabled]}
                                onPress={submitSnipe}
                                disabled={!selectedFriend || submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.sendText}>Send Snipe</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <Modal visible={isPickerVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalSheet, isDark && styles.modalSheetDark]}>
                            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Select Target</Text>
                            <TextInput
                                style={[styles.captionInput, { marginBottom: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: isDark ? '#fff' : '#000' }]}
                                placeholder="Search friends..."
                                placeholderTextColor={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'}
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
                                onPress={() => { setIsPickerVisible(false); setSearchQuery(''); }}
                            >
                                <Text style={[styles.cancelText, isDark && styles.cancelTextDark]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    // Phase 1: Camera with crosshair + capture button only
    return (
        <View style={styles.container}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back">
                <Crosshair />
                <View style={styles.cameraUi}>
                    <View style={styles.captureRow}>
                        <TouchableOpacity style={styles.captureButton} onPress={capture}>
                            <View style={styles.captureInner} />
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', backgroundColor: '#0B0B0F' },
    message: { textAlign: 'center', paddingBottom: 10, color: '#fff' },
    camera: { flex: 1 },

    crossLine: { position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 0.8)' },
    crossDot: {
        position: 'absolute', width: 6, height: 6, borderRadius: 3,
        backgroundColor: 'rgba(255, 59, 48, 0.9)',
        top: '50%', left: '50%', marginTop: -3, marginLeft: -3,
    },

    // Phase 1: camera UI
    cameraUi: { flex: 1, justifyContent: 'flex-end', paddingBottom: 50 },
    captureRow: { alignItems: 'center' },
    captureButton: {
        width: 80, height: 80, borderRadius: 40,
        borderWidth: 4, borderColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
    },
    captureInner: {
        width: 62, height: 62, borderRadius: 31,
        backgroundColor: 'rgba(255, 59, 48, 0.85)',
    },

    // Phase 2: review overlay
    reviewOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        paddingTop: 80,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    statusBadge: {
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    },
    statusText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    reviewForm: { gap: 12 },
    targetSelector: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 14, borderRadius: 12, alignItems: 'center',
    },
    targetSelectorText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    captionInput: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: '#fff', padding: 12, borderRadius: 12, fontSize: 15,
    },
    reviewActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
    discardButton: {
        flex: 1, alignItems: 'center', paddingVertical: 16,
        borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)',
    },
    discardText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    sendButton: {
        flex: 2, alignItems: 'center', paddingVertical: 16,
        borderRadius: 14, backgroundColor: 'rgba(255, 59, 48, 0.9)',
    },
    sendButtonDisabled: { opacity: 0.4 },
    sendText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 20, maxHeight: '60%',
    },
    modalSheetDark: { backgroundColor: '#1c1c1e' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#111' },
    modalTitleDark: { color: '#f0f0f0' },
    emptyText: { textAlign: 'center', color: '#888', marginVertical: 20 },
    cancelButton: { marginTop: 16, alignItems: 'center', padding: 12, backgroundColor: '#f2f2f2', borderRadius: 12 },
    cancelButtonDark: { backgroundColor: '#2c2c2e' },
    cancelText: { fontSize: 16, fontWeight: '600', color: '#333' },
    cancelTextDark: { color: '#f0f0f0' },
});
