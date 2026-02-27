import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={styles.lines}>
          <View style={styles.titleLine} />
          <View style={styles.subtitleLine} />
        </View>
      </View>
      <View style={styles.image} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#15151B',
    borderRadius: 18,
    marginBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  lines: {
    gap: 6,
    flex: 1,
  },
  titleLine: {
    height: 12,
    width: '55%',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  subtitleLine: {
    height: 10,
    width: '35%',
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
