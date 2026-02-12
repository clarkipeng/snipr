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

Amplify.configure(outputs);

export const unstable_settings = {
  anchor: '(tabs)',
};

const MyAppHeader = () => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerText}>Welcome to Snipr</Text>
  </View>
);

import type { Schema } from '@/amplify/data/resource';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { useEffect } from 'react';

const client = generateClient<Schema>();

function LayoutContent() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function checkOrCreateUserProfile() {
      if (authStatus === 'authenticated') {
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        const email = attributes.email;
        if (!email) return;
        const { data: profiles } = await client.models.UserProfile.list({
          filter: { email: { eq: email } }
        });
        if (profiles.length === 0) {
          console.log('Creating new UserProfile for:', email);
          await client.models.UserProfile.create({
            email: email,
          });
        }
      }
    }

    checkOrCreateUserProfile();
  }, [authStatus]);

  if (authStatus === 'authenticated') {
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
