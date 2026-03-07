import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';

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
      <Text style={styles.sniperAvatarInitial}>
        {name.charAt(0).toUpperCase()}
      </Text>
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.cardOuter, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={styles.card}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={styles.header}>
          <SniperAvatar url={sniperProfilePictureUrl} name={sniperName} />
          <Text style={styles.names} numberOfLines={2}>
            <Text style={styles.sniperName}>{sniperName}</Text>
            <Text style={styles.actionText}> sniped </Text>
            <Text style={styles.targetName}>{targetName}</Text>
          </Text>
          <Text style={styles.time}>{formatTime(createdAt)}</Text>
        </View>

        {imageUrl && (
          <View>
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
            {caption && (
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageGradient}
              />
            )}
          </View>
        )}

        {caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.caption}>{caption}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#15151B',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  sniperAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    flexShrink: 0,
  },
  sniperAvatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sniperAvatarInitial: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  names: {
    flex: 1,
    marginRight: 8,
  },
  sniperName: {
    fontWeight: '800',
    fontSize: 14,
    color: '#fff',
    letterSpacing: 0.3,
  },
  actionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  targetName: {
    fontWeight: '800',
    fontSize: 14,
    color: '#fff',
    letterSpacing: 0.3,
  },
  time: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#0B0B0F',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  captionContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.8)',
  },
});
