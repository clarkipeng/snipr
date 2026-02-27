import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

type ModeToggleProps = {
  mode: 'friends' | 'global';
  onModeChange: (mode: 'friends' | 'global') => void;
};

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TouchableOpacity
        style={[styles.tab, mode === 'friends' && (isDark ? styles.activeTabDark : styles.activeTab)]}
        onPress={() => onModeChange('friends')}
      >
        <Text style={[styles.tabText, mode === 'friends' && (isDark ? styles.activeTabTextDark : styles.activeTabText)]}>
          Friends
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, mode === 'global' && (isDark ? styles.activeTabDark : styles.activeTab)]}
        onPress={() => onModeChange('global')}
      >
        <Text style={[styles.tabText, mode === 'global' && (isDark ? styles.activeTabTextDark : styles.activeTabText)]}>
          Global
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 4,
  },
  containerDark: {
    backgroundColor: '#1c1c1e',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 21,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  activeTabDark: {
    backgroundColor: '#2c2c2e',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  activeTabText: {
    color: '#000',
  },
  activeTabTextDark: {
    color: '#fff',
  },
});
