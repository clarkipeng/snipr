import type { Schema } from "@/amplify/data/resource";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

const client = generateClient<Schema>();

interface ProfileSetupScreenProps {
    onComplete: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupScreenProps) {
    const [name, setName] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
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
        if (loading) {
            console.error("Profile Setup Error: Loading");
            return;
        }
        setLoading(true);
        if (image == null || name == null) {
            setLoading(false);
            console.error("Profile Setup Error: Missing image or name");
            return;
        }

        try {
            const sessions = await fetchAuthSession();
            const identityId = sessions.identityId;
            const attributes = await fetchUserAttributes();
            const email = attributes.email;

            if (!email || !identityId) throw new Error('No user info found');

            const response = await fetch(image);
            const blob = await response.blob();
            const filename = `profile.jpg`;
            const path = `public/profiles/${identityId}/${filename}`;

            await uploadData({
                path,
                data: blob,
            }).result;

            await client.models.UserProfile.create({
                email: email,
                name: name,
                profilePicture: path,
            });
            console.error("Profile Setup Success");
            onComplete();
        } catch (e) {
            console.error("Profile Setup Error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />
            <Button title={image ? "Change Image" : "Upload Image"} onPress={pickImage} />
            {image && <Text style={{ textAlign: 'center', marginBottom: 10 }}>Image Selected</Text>}
            <Button title={loading ? "Saving..." : "Submit"} onPress={handleSubmit} disabled={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 20,
        borderRadius: 5
    }
});
