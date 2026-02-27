import { Pressable, StyleSheet, Text, View } from 'react-native';

type ModeToggleProps = {
  mode: 'friends' | 'global';
  onModeChange: (mode: 'friends' | 'global') => void;
};

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Pressable style={styles.tab} onPress={() => onModeChange('friends')}>
          <Text style={[styles.tabText, mode === 'friends' && styles.activeText]}>
            FRIENDS
          </Text>
          {mode === 'friends' && <View style={styles.underline} />}
        </Pressable>
        <Pressable style={styles.tab} onPress={() => onModeChange('global')}>
          <Text style={[styles.tabText, mode === 'global' && styles.activeText]}>
            GLOBAL
          </Text>
          {mode === 'global' && <View style={styles.underline} />}
        </Pressable>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 24,
  },
  tab: {
    paddingBottom: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.45)',
  },
  activeText: {
    color: '#fff',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,59,48,0.9)',
    borderRadius: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
