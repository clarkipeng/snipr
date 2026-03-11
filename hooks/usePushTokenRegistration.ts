import type { Schema } from '@/amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

const client = generateClient<Schema>();

/**
 * Registers for push notifications and saves the Expo push token to the
 * current user's UserProfile so the backend can send "you were sniped" etc.
 * Call when the user is authenticated and has a profile (hasProfile === true).
 * Push only works on a physical device (not simulator) and in a development/build app (not Expo Go).
 */
export function usePushTokenRegistration(
  isActive: boolean,
  userProfileId: string | null,
) {
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isActive || !userProfileId) return;
    const profileId: string = userProfileId;

    let cancelled = false;

    async function register() {
      try {
        if (!Device.isDevice) return;

        const { status: existing } = await Notifications.getPermissionsAsync();
        let final = existing;
        if (existing !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          final = status;
        }
        if (final !== 'granted') return;

        const projectId = require('../app.json').expo?.extra?.eas?.projectId;
        const tokenData = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined,
        );
        const rawToken = tokenData?.data;
        if (cancelled || rawToken == null || rawToken === '') return;
        if (lastTokenRef.current === rawToken) return;
        lastTokenRef.current = rawToken;

        await client.models.UserProfile.update({
          id: profileId,
          expoPushToken: rawToken as string,
        });
      } catch (e) {
        console.warn('Push token registration failed:', e);
      }
    }

    register();
    return () => {
      cancelled = true;
    };
  }, [isActive, userProfileId]);
}
