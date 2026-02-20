import { ThemedText } from '@/components/themed-text';
import { Image, StyleSheet, View } from 'react-native';

type LeaderboardRowProps = {
  rank: number;
  name: string;
  profilePictureUrl: string | null;
  snipeCount: number;
  timesSnipedCount: number;
};

function getRankStyle(rank: number) {
  if (rank === 1) return styles.gold;
  if (rank === 2) return styles.silver;
  if (rank === 3) return styles.bronze;
  return styles.defaultRank;
}

function getRankLabel(rank: number) {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
}

export function LeaderboardRow({
  rank,
  name,
  profilePictureUrl,
  snipeCount,
  timesSnipedCount,
}: LeaderboardRowProps) {
  return (
    <View style={[styles.row, rank <= 3 && styles.topRow]}>
      <View style={[styles.rankBadge, getRankStyle(rank)]}>
        <ThemedText style={styles.rankText}>{getRankLabel(rank)}</ThemedText>
      </View>

      {profilePictureUrl ? (
        <Image source={{ uri: profilePictureUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <ThemedText style={styles.avatarInitial}>
            {name.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
      )}

      <View style={styles.info}>
        <ThemedText style={styles.name}>{name}</ThemedText>
        <ThemedText style={styles.stats}>
          {snipeCount} snipe{snipeCount !== 1 ? 's' : ''} · sniped {timesSnipedCount} time{timesSnipedCount !== 1 ? 's' : ''}
        </ThemedText>
      </View>

      <View style={styles.scoreContainer}>
        <ThemedText style={styles.score}>{snipeCount}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  topRow: {
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontWeight: '800',
    fontSize: 13,
  },
  gold: {
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
  },
  silver: {
    backgroundColor: 'rgba(192, 192, 192, 0.25)',
  },
  bronze: {
    backgroundColor: 'rgba(205, 127, 50, 0.25)',
  },
  defaultRank: {
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontWeight: '700',
    fontSize: 16,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: '600',
    fontSize: 15,
  },
  stats: {
    fontSize: 12,
    opacity: 0.5,
  },
  scoreContainer: {
    marginLeft: 12,
    alignItems: 'center',
  },
  score: {
    fontWeight: '800',
    fontSize: 20,
  },
});
