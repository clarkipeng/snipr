import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

/**
 * Check if two dates are on consecutive days
 */
function isConsecutiveDay(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Reset time to start of day
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays === 1;
}

/**
 * Check if two dates are on the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Update user's snipe streak after they make a snipe
 */
export async function updateStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  isNewRecord: boolean;
}> {
  try {
    // Get user profile
    const { data: profile } = await client.models.UserProfile.get({ id: userId });
    if (!profile) {
      throw new Error('User profile not found');
    }

    const now = new Date();
    const lastSnipeDate = profile.lastSnipeDate ? new Date(profile.lastSnipeDate) : null;
    let currentStreak = profile.currentStreak || 0;
    let longestStreak = profile.longestStreak || 0;

    // If they already sniped today, don't update streak
    if (lastSnipeDate && isSameDay(now, lastSnipeDate)) {
      return { currentStreak, longestStreak, isNewRecord: false };
    }

    // If they sniped yesterday, increment streak
    if (lastSnipeDate && isConsecutiveDay(lastSnipeDate, now)) {
      currentStreak += 1;
    } else {
      // Streak broken or first snipe, reset to 1
      currentStreak = 1;
    }

    // Update longest streak if current is higher
    const isNewRecord = currentStreak > longestStreak;
    if (isNewRecord) {
      longestStreak = currentStreak;
    }

    // Update user profile
    await client.models.UserProfile.update({
      id: userId,
      currentStreak,
      longestStreak,
      lastSnipeDate: now.toISOString().split('T')[0], // Store as YYYY-MM-DD
    });

    return { currentStreak, longestStreak, isNewRecord };
  } catch (err) {
    console.error('Error updating streak:', err);
    throw err;
  }
}

/**
 * Calculate current streak from snipe history (for initial calculation)
 */
export async function calculateStreakFromHistory(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
}> {
  try {
    // Get all user's snipes
    const { data: snipes } = await client.models.Snipe.list({
      filter: { sniperId: { eq: userId } },
      limit: 1000,
    });

    if (snipes.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Sort by date (newest first)
    const sorted = snipes
      .map(s => new Date(s.createdAt))
      .sort((a, b) => b.getTime() - a.getTime());

    // Get unique days
    const uniqueDays = Array.from(
      new Set(
        sorted.map(date => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      )
    ).map(timestamp => new Date(timestamp))
     .sort((a, b) => b.getTime() - a.getTime()); // Sort descending

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Calculate current streak (from today backwards)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's a snipe today or yesterday
    const mostRecent = uniqueDays[0];
    if (isSameDay(mostRecent, today) || isConsecutiveDay(mostRecent, today)) {
      currentStreak = 1;

      // Count consecutive days backwards
      for (let i = 1; i < uniqueDays.length; i++) {
        if (isConsecutiveDay(uniqueDays[i], uniqueDays[i - 1])) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak ever
    tempStreak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      if (isConsecutiveDay(uniqueDays[i], uniqueDays[i - 1])) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    return { currentStreak, longestStreak };
  } catch (err) {
    console.error('Error calculating streak from history:', err);
    return { currentStreak: 0, longestStreak: 0 };
  }
}
