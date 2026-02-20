import { ThemedText } from '@/components/themed-text';
import { Image, StyleSheet, View } from 'react-native';

type SnipeCardProps = {
  sniperName: string;
  targetName: string;
  imageUrl: string | null;
  caption: string | null;
  createdAt: string;
};

function formatTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function SnipeCard({ sniperName, targetName, imageUrl, caption, createdAt }: SnipeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.names}>
          <ThemedText style={styles.sniperName}>{sniperName}</ThemedText>
          <ThemedText style={styles.action}> sniped </ThemedText>
          <ThemedText style={styles.targetName}>{targetName}</ThemedText>
        </View>
        <ThemedText style={styles.time}>{formatTime(createdAt)}</ThemedText>
      </View>

      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      )}

      {caption && (
        <View style={styles.captionContainer}>
          <ThemedText style={styles.caption}>{caption}</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  names: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  sniperName: {
    fontWeight: '700',
    fontSize: 15,
  },
  action: {
    fontSize: 14,
    opacity: 0.6,
  },
  targetName: {
    fontWeight: '700',
    fontSize: 15,
  },
  time: {
    fontSize: 12,
    opacity: 0.5,
    marginLeft: 8,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#222',
  },
  captionContainer: {
    padding: 12,
  },
  caption: {
    fontSize: 14,
  },
});
