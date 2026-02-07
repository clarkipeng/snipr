import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Authenticator } from '@aws-amplify/ui-react-native';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Authenticator.Provider>
      <Authenticator Header={MyAppHeader}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </Authenticator>
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
