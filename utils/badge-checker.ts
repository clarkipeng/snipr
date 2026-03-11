import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

export type BadgeType = 'ELITE_ASSASSIN' | 'UNSTOPPABLE' | 'NINJA';

export const BADGE_INFO = {
  ELITE_ASSASSIN: {
    name: 'Elite Assassin',
    description: 'Achieved 50 snipes',
    emoji: '🎯',
  },
  UNSTOPPABLE: {
    name: 'Unstoppable',
    description: '10 snipes in one day',
    emoji: '⚡',
  },
  NINJA: {
    name: 'Ninja',
    description: 'Not sniped for 5 days',
    emoji: '🥷',
  },
};

/**
 * Check if user has earned Elite Assassin badge (50+ total snipes)
 */
export async function checkEliteAssassin(userId: string): Promise<boolean> {
  try {
    const { data: snipes } = await client.models.Snipe.list({
      filter: { sniperId: { eq: userId } },
      limit: 1000,
    });
    return snipes.length >= 50;
  } catch (err) {
    console.error('Error checking Elite Assassin badge:', err);
    return false;
  }
}

/**
 * Check if user has earned Unstoppable badge (10+ snipes in last 24 hours)
 */
export async function checkUnstoppable(userId: string): Promise<boolean> {
  try {
    const { data: snipes } = await client.models.Snipe.list({
      filter: { sniperId: { eq: userId } },
      limit: 1000,
    });

    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const recentSnipes = snipes.filter(
      (s) => new Date(s.createdAt) >= oneDayAgo
    );

    return recentSnipes.length >= 10;
  } catch (err) {
    console.error('Error checking Unstoppable badge:', err);
    return false;
  }
}

/**
 * Check if user has earned Ninja badge (not sniped for 5 consecutive days)
 */
export async function checkNinja(userId: string): Promise<boolean> {
  try {
    const { data: snipes } = await client.models.Snipe.list({
      filter: { targetId: { eq: userId } },
      limit: 1000,
    });

    if (snipes.length === 0) {
      // Never been sniped - qualifies for Ninja
      return true;
    }

    // Find most recent snipe where user was target
    const sortedSnipes = [...snipes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const mostRecentSnipe = sortedSnipes[0];

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    return new Date(mostRecentSnipe.createdAt) < fiveDaysAgo;
  } catch (err) {
    console.error('Error checking Ninja badge:', err);
    return false;
  }
}

/**
 * Check all badges for a user and return which ones they've earned
 */
export async function checkAllBadges(
  userId: string
): Promise<{ badgeType: BadgeType; earned: boolean }[]> {
  const [eliteAssassin, unstoppable, ninja] = await Promise.all([
    checkEliteAssassin(userId),
    checkUnstoppable(userId),
    checkNinja(userId),
  ]);

  return [
    { badgeType: 'ELITE_ASSASSIN', earned: eliteAssassin },
    { badgeType: 'UNSTOPPABLE', earned: unstoppable },
    { badgeType: 'NINJA', earned: ninja },
  ];
}

/**
 * Award a badge to a user if they don't already have it
 */
export async function awardBadge(
  userId: string,
  badgeType: BadgeType
): Promise<boolean> {
  try {
    // Check if user already has this badge
    const { data: existingBadges } = await client.models.UserBadge.list({
      filter: {
        userId: { eq: userId },
        badgeType: { eq: badgeType },
      },
    });

    if (existingBadges.length > 0) {
      console.log(`User ${userId} already has ${badgeType} badge`);
      return false;
    }

    // Award the badge
    await client.models.UserBadge.create({
      userId,
      badgeType,
      awardedAt: new Date().toISOString(),
    });

    console.log(`Awarded ${badgeType} badge to user ${userId}`);
    return true;
  } catch (err) {
    console.error(`Error awarding ${badgeType} badge:`, err);
    return false;
  }
}

/**
 * Check and award all earned badges for a user
 * Returns array of newly awarded badges
 */
export async function checkAndAwardBadges(
  userId: string
): Promise<BadgeType[]> {
  const badgeChecks = await checkAllBadges(userId);
  const newlyAwarded: BadgeType[] = [];

  for (const { badgeType, earned } of badgeChecks) {
    if (earned) {
      const awarded = await awardBadge(userId, badgeType);
      if (awarded) {
        newlyAwarded.push(badgeType);
      }
    }
  }

  return newlyAwarded;
}

/**
 * Get all badges for a user
 */
export async function getUserBadges(userId: string): Promise<
  Array<{
    badgeType: BadgeType;
    awardedAt: string;
  }>
> {
  try {
    const { data: badges } = await client.models.UserBadge.list({
      filter: { userId: { eq: userId } },
      limit: 100,
    });

    return badges.map((b) => ({
      badgeType: b.badgeType as BadgeType,
      awardedAt: b.awardedAt,
    }));
  } catch (err) {
    console.error('Error fetching user badges:', err);
    return [];
  }
}
