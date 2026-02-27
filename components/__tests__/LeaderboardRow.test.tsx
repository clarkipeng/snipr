import { fireEvent, render } from '@testing-library/react-native';
import { LeaderboardRow } from '../LeaderboardRow';

describe('LeaderboardRow', () => {
  it('renders name and score text', () => {
    const { getByText } = render(
      <LeaderboardRow
        rank={2}
        name="Khant"
        profilePictureUrl={null}
        snipeCount={7}
        timesSnipedCount={3}
      />
    );

    expect(getByText('Khant')).toBeTruthy();
    expect(getByText('7')).toBeTruthy();
    expect(getByText('snipes')).toBeTruthy();
  });

  it('fires onPress when row is tappable', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <LeaderboardRow
        rank={4}
        name="Clark"
        profilePictureUrl={null}
        snipeCount={2}
        timesSnipedCount={1}
        onPress={onPress}
      />
    );

    fireEvent.press(getByText('Clark'));
    expect(onPress).toHaveBeenCalled();
  });
});
