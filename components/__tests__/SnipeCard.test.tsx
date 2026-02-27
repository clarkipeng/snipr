import { render } from '@testing-library/react-native';
import React from 'react';
import { SnipeCard } from '../SnipeCard';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children?: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

describe('SnipeCard', () => {
  it('renders sniper, target, and caption', () => {
    const now = new Date().toISOString();
    const { getByText } = render(
      <SnipeCard
        sniperName="Khant"
        targetName="Shaun"
        sniperProfilePictureUrl={null}
        imageUrl={null}
        caption="Got you at the library"
        createdAt={now}
      />
    );

    expect(getByText('Khant')).toBeTruthy();
    expect(getByText('Shaun')).toBeTruthy();
    expect(getByText('Got you at the library')).toBeTruthy();
  });
});
