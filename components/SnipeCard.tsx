import { ThemedText } from '@/components/themed-text';
import { Image, StyleSheet, View } from 'react-native';

type SnipeCardProps = {
  sniperName: string;
  targetName: string;
  sniperProfilePictureUrl: string | null;
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

function SniperAvatar({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return <Image source={{ uri: url }} style={styles.sniperAvatar} />;
  }
  return (
    <View style={[styles.sniperAvatar, styles.sniperAvatarPlaceholder]}>
      <ThemedText style={styles.sniperAvatarInitial}>
        {name.charAt(0).toUpperCase()}
      </ThemedText>
    </View>
  );
}

export function SnipeCard({
  sniperName,
  targetName,
  sniperProfilePictureUrl,
  imageUrl,
  caption,
  createdAt,
}: SnipeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SniperAvatar url={sniperProfilePictureUrl} name={sniperName} />
        <View style={styles.names}>
          <ThemedText style={styles.sniperName}>{sniperName}</ThemedText>
          <ThemedText style={styles.crosshair}> 🎯 </ThemedText>
          <ThemedText style={styles.targetName}>{targetName}</ThemedText>
        </View>
        <ThemedText style={styles.time}>{formatTime(createdAt)}</ThemedText>
      </View>

      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
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
    backgroundColor: 'rgba(150, 150, 150, 0.08)',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  sniperAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    flexShrink: 0,
  },
  sniperAvatarPlaceholder: {
    backgroundColor: 'rgba(150, 150, 150, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sniperAvatarInitial: {
    fontSize: 13,
    fontWeight: '700',
  },
  names: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  sniperName: {
    fontWeight: '700',
    fontSize: 15,
  },
  crosshair: {
    fontSize: 14,
  },
  targetName: {
    fontWeight: '700',
    fontSize: 15,
  },
  time: {
    fontSize: 12,
    opacity: 0.45,
    flexShrink: 0,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#1a1a1a',
  },
  captionContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
