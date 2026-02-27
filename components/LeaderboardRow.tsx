import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    <Container onPress={onPress} style={styles.row}>
      <View style={[styles.rankBadge, getRankStyle(rank)]}>
        {medal ? (
          <Text style={styles.medalText}>{medal}</Text>
        ) : (
          <Text style={styles.rankText}>{rank}</Text>
        )}
      </View>

      {profilePictureUrl ? (
        <Image source={{ uri: profilePictureUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.stats}>
          sniped {timesSnipedCount} time{timesSnipedCount !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{displayScore}</Text>
        <Text style={styles.scoreLabel}>snipes</Text>
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
    borderBottomColor: 'rgba(255,255,255,0.06)',
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
    color: 'rgba(255,255,255,0.6)',
  },
  gold: { backgroundColor: 'rgba(255, 215, 0, 0.15)' },
  silver: { backgroundColor: 'rgba(192, 192, 192, 0.15)' },
  bronze: { backgroundColor: 'rgba(205, 127, 50, 0.15)' },
  defaultRank: { backgroundColor: 'rgba(255,255,255,0.06)' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontWeight: '700',
    fontSize: 17,
    color: 'rgba(255,255,255,0.6)',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontWeight: '600',
    fontSize: 15,
    color: '#fff',
  },
  stats: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  scoreContainer: {
    marginLeft: 12,
    alignItems: 'center',
  },
  score: {
    fontWeight: '800',
    fontSize: 22,
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 1,
  },
});
