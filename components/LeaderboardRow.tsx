import { ThemedText } from '@/components/themed-text';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

type LeaderboardRowProps = {
  rank: number;
  name: string;
  profilePictureUrl: string | null;
  snipeCount: number;
  timesSnipedCount: number;
  displayMultiplier?: number;
  onPress?: () => void;
};

function getMedalEmoji(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

function getRankStyle(rank: number) {
  if (rank === 1) return styles.gold;
  if (rank === 2) return styles.silver;
  if (rank === 3) return styles.bronze;
  return styles.defaultRank;
}

export function LeaderboardRow({
  rank,
  name,
  profilePictureUrl,
  snipeCount,
  timesSnipedCount,
  displayMultiplier = 1,
  onPress,
}: LeaderboardRowProps) {
  const medal = getMedalEmoji(rank);
  const Container = onPress ? TouchableOpacity : View;
  const displayScore = Math.round(snipeCount * displayMultiplier);

  return (
    <Container onPress={onPress} style={[styles.row, rank <= 3 && styles.topRow]}>
      <View style={[styles.rankBadge, getRankStyle(rank)]}>
        {medal ? (
          <ThemedText style={styles.medalText}>{medal}</ThemedText>
        ) : (
          <ThemedText style={styles.rankText}>{rank}</ThemedText>
        )}
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
          sniped {timesSnipedCount} time{timesSnipedCount !== 1 ? 's' : ''}
        </ThemedText>
      </View>

      <View style={styles.scoreContainer}>
        <ThemedText style={styles.score}>{displayScore}</ThemedText>
        <ThemedText style={styles.scoreLabel}>snipes</ThemedText>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  topRow: {
    backgroundColor: 'rgba(150, 150, 150, 0.07)',
  },
  rankBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medalText: {
    fontSize: 20,
  },
  rankText: {
    fontWeight: '800',
    fontSize: 14,
  },
  gold: { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
  silver: { backgroundColor: 'rgba(192, 192, 192, 0.2)' },
  bronze: { backgroundColor: 'rgba(205, 127, 50, 0.2)' },
  defaultRank: { backgroundColor: 'rgba(150, 150, 150, 0.1)' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontWeight: '700',
    fontSize: 17,
  },
  info: {
    flex: 1,
    gap: 3,
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
    fontSize: 22,
  },
  scoreLabel: {
    fontSize: 10,
    opacity: 0.45,
    marginTop: 1,
  },
});
