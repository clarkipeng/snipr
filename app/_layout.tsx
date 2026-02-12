import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

import type { Schema } from '@/amplify/data/resource';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import ProfileSetup from '../components/ProfileSetup';

Amplify.configure(outputs);

export const unstable_settings = {
  anchor: '(tabs)',
};

const MyAppHeader = () => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerText}>Welcome to Snipr</Text>
  </View>
);

const client = generateClient<Schema>();

function LayoutContent() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const colorScheme = useColorScheme();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkProfile() {
      if (authStatus === 'authenticated') {
        const attributes = await fetchUserAttributes();
        const email = attributes.email;

        if (!email) {
          setHasProfile(false);
          return;
        }

        const { data: profiles } = await client.models.UserProfile.list({
          filter: { email: { eq: email } }
        });

        if (profiles.length > 0) {
          setHasProfile(true);
        } else {
          setHasProfile(false);
        }
      }
    }

    checkProfile();
  }, [authStatus]);

  if (authStatus === 'authenticated') {
    if (hasProfile == null) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10 }}>Checking Profile...</Text>
        </View>
      );
    }
    if (hasProfile === false) {
      return (
        <View style={{ flex: 1 }}>
          <ProfileSetup onComplete={() => setHasProfile(true)} />
        </View>
      );
    }

    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Authenticator Header={MyAppHeader} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Authenticator.Provider>
      <LayoutContent />
    </Authenticator.Provider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});
