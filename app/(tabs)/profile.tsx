/**
 * Profile Tab
 *
 * Shows the current logged-in user's profile with stats and sign out.
 * Uses the shared ProfileView component.
 */

import { ProfileView } from '@/components/ProfileView';

export default function ProfileTab() {
  return <ProfileView showSignOut />;
}
