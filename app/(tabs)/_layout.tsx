import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Schema } from '@/amplify/data/resource';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

const client = generateClient<Schema>();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function fetchPendingRequests() {
      try {
        const attrs = await fetchUserAttributes();
        const { data: users } = await client.models.UserProfile.list({
          filter: { email: { eq: attrs.email } },
        });
        const me = users[0];
        if (!me) return;
        const { data: requests } = await client.models.FriendRequest.list({
          filter: { receiverId: { eq: me.id } },
        });
        setPendingCount(requests.length);
      } catch {}
    }
    fetchPendingRequests();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="trophy.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="sniping"
        options={{
          title: 'Snip',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="camera.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
