import { uploadData } from 'aws-amplify/storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SnipingScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [status, setStatus] = useState('');
    const [isSniping, setIsSniping] = useState(false);

    const takePicture = async () => {
        if (!cameraRef.current) return;

        setIsSniping(true);
        setStatus('Sniping...');
        console.log('Starting snipe...');

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.7,
                base64: false,
                exif: false,
            });

            console.log('Photo captured:', photo?.uri);

            if (photo?.uri) {
                setStatus('Uploading...');
                const response = await fetch(photo.uri);
                const blob = await response.blob();
                const filename = `snipes/${Date.now()}.jpg`;

                const result = await uploadData({
                    path: filename,
                    data: blob,
                }).result;

                console.log('Upload success:', result);
                setStatus('Snipped! Uploaded to S3.');

                // Reset status after a delay
                setTimeout(() => {
                    setStatus('');
                    setIsSniping(false);
                }, 3000);
            }
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

    return (
        <View style={styles.container}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back">
                <View style={styles.uiContainer}>
                    {status ? (
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{status}</Text>
                        </View>
                    ) : null}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, isSniping && styles.buttonDisabled]} onPress={takePicture} disabled={isSniping}>
                            {isSniping ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.text}>Snip!</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
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
    buttonContainer: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        marginBottom: 40,
        justifyContent: 'center',
    },
    button: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.8)', // Red for sniping
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
});
