import type { Schema } from "@/amplify/data/resource";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const client = generateClient<Schema>();

interface ProfileSetupScreenProps {
    onComplete: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupScreenProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [name, setName] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (loading || !image || !name.trim()) return;
        setLoading(true);
        try {
            const sessions = await fetchAuthSession();
            const identityId = sessions.identityId;
            const attributes = await fetchUserAttributes();
            const email = attributes.email;
            if (!email || !identityId) throw new Error('No user info found');

            const response = await fetch(image);
            const blob = await response.blob();
            const path = `public/profiles/${identityId}/profile.jpg`;
            await uploadData({ path, data: blob }).result;

            await client.models.UserProfile.create({
                email,
                name: name.trim(),
                profilePicture: path,
            });
            onComplete();
        } catch (e) {
            console.error("Profile Setup Error:", e);
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = name.trim().length > 0 && image !== null && !loading;

    return (
        <KeyboardAvoidingView
            style={[styles.container, isDark && styles.containerDark]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.inner}>
                <Text style={[styles.title, isDark && styles.titleDark]}>Create your profile</Text>
                <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>Choose a photo and pick a name to get started.</Text>

                <TouchableOpacity style={styles.avatarPicker} onPress={pickImage} activeOpacity={0.8}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <IconSymbol name="camera.fill" size={32} color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"} />
                        </View>
                    )}
                    <View style={styles.avatarBadge}>
                        <Text style={styles.avatarBadgeText}>+</Text>
                    </View>
                </TouchableOpacity>

                <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    placeholder="Your name"
                    placeholderTextColor={isDark ? '#666' : '#aaa'}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    returnKeyType="done"
                />

                <TouchableOpacity
                    style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitText}>Get Started</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerDark: {
        backgroundColor: '#000',
    },
    inner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111',
        marginBottom: 8,
        textAlign: 'center',
    },
    titleDark: { color: '#f0f0f0' },
    subtitle: {
        fontSize: 15,
        color: '#888',
        marginBottom: 40,
        textAlign: 'center',
        lineHeight: 22,
    },
    subtitleDark: { color: '#888' },
    avatarPicker: {
        marginBottom: 36,
        position: 'relative',
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    cameraEmoji: {
        fontSize: 36,
    },
    avatarBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarBadgeText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 22,
    },
    input: {
        width: '100%',
        height: 54,
        backgroundColor: '#f5f5f5',
        borderRadius: 14,
        paddingHorizontal: 18,
        fontSize: 16,
        color: '#111',
        marginBottom: 16,
    },
    inputDark: {
        backgroundColor: '#1c1c1e',
        color: '#f0f0f0',
    },
    submitButton: {
        width: '100%',
        height: 54,
        backgroundColor: '#111',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitDisabled: {
        backgroundColor: '#ccc',
    },
    submitText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
});
