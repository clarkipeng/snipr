import { Pressable, StyleSheet, Text, View } from 'react-native';

type Reaction = {
  emoji: string;
  count: number;
  userIds: string[];
  hasReacted: boolean;
};

type ReactionBarProps = {
  reactions: Reaction[];
  onReactionPress: (emoji: string) => void;
  onAddPress: () => void;
};

export function ReactionBar({ reactions, onReactionPress, onAddPress }: ReactionBarProps) {
  if (reactions.length === 0) {
    return (
      <View style={styles.container}>
        <Pressable onPress={onAddPress} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ React</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {reactions.map((r) => (
        <Pressable
          key={r.emoji}
          onPress={() => onReactionPress(r.emoji)}
          style={[styles.reactionPill, r.hasReacted && styles.reactionPillActive]}
        >
          <Text style={styles.emoji}>{r.emoji}</Text>
          {r.count > 1 && <Text style={styles.count}>{r.count}</Text>}
        </Pressable>
      ))}
      <Pressable onPress={onAddPress} style={styles.addButtonSmall}>
        <Text style={styles.addButtonSmallText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reactionPillActive: {
    backgroundColor: 'rgba(255,59,48,0.15)',
    borderColor: 'rgba(255,59,48,0.4)',
  },
  emoji: {
    fontSize: 16,
  },
  count: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  addButtonSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonSmallText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
});
