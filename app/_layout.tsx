import "@aws-amplify/react-native";
import "react-native-get-random-values";
import "react-native-reanimated";
import "react-native-url-polyfill/auto";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react-native";
import { Amplify } from "aws-amplify";
import { fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";

import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import type { Schema } from "@/amplify/data/resource";
import AuthScreen from "@/components/AuthScreen";
import { PendingRequestsProvider } from "@/context/PendingRequestsContext";
import { usePushTokenRegistration } from "@/hooks/usePushTokenRegistration";
import outputs from "../amplify_outputs.json";
import ProfileSetup from "../components/ProfileSetup";

Amplify.configure(outputs);

export const unstable_settings = {
  anchor: "(tabs)",
};

const SniprDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0B0B0F",
    card: "#0B0B0F",
    border: "rgba(255,255,255,0.06)",
    text: "#fff",
    primary: "#FF3B30",
  },
};

const client = generateClient<Schema>();

function LayoutContent() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [currentUserProfileId, setCurrentUserProfileId] = useState<
    string | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    async function checkProfile() {
      if (authStatus === "authenticated") {
        try {
          const attributes = await fetchUserAttributes();
          const email = attributes.email;

          if (!email) {
            if (!cancelled) setHasProfile(false);
            return;
          }

          const { data: profiles } = await client.models.UserProfile.list({
            filter: { email: { eq: email } },
          });

          if (!cancelled) {
            setHasProfile(profiles.length > 0);
            setCurrentUserProfileId(profiles[0]?.id ?? null);
          }
        } catch (error) {
          console.error("Failed to check user profile:", error);
          if (!cancelled) setHasProfile(false);
        }
      }
    }

    checkProfile();
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  usePushTokenRegistration(hasProfile === true, currentUserProfileId);

  if (authStatus === "authenticated") {
    if (hasProfile == null) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#0B0B0F",
          }}
        >
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.6)" }}>
            Checking Profile...
          </Text>
        </View>
      );
    }
    if (hasProfile === false) {
      return (
        <View style={{ flex: 1, backgroundColor: "#0B0B0F" }}>
          <ProfileSetup onComplete={() => setHasProfile(true)} />
        </View>
      );
    }

    return (
      <PendingRequestsProvider>
        <ThemeProvider value={SniprDarkTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
                title: "Profile",
                headerStyle: { backgroundColor: "#0B0B0F" },
                headerTintColor: "#fff",
              }}
            />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </PendingRequestsProvider>
    );
  }

  return <AuthScreen />;
}

export default function RootLayout() {
  return (
    <Authenticator.Provider>
      <LayoutContent />
    </Authenticator.Provider>
  );
}
