import { Platform } from 'react-native';

const tintColorLight = '#FF3B30';
const tintColorDark = '#FF3B30';

export const Colors = {
  light: {
    text: '#ECEDEE',
    background: '#0B0B0F',
    tint: tintColorLight,
    icon: '#9BA1A6',
    tabIconDefault: '#555',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#0B0B0F',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#555',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
