/**
 * Profile Modal
 *
 * Shows a user's profile when tapped from the leaderboard.
 * Reads the userId from the route query params.
 * If no userId is passed, shows the current user's profile.
 */

import { ProfileView } from '@/components/ProfileView';
import { useLocalSearchParams } from 'expo-router';

export default function ProfileModal() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();

  return <ProfileView userId={userId} />;
}
