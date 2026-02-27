import { fireEvent, render } from '@testing-library/react-native';
import { ModeToggle } from '../ModeToggle';

describe('ModeToggle', () => {
  it('calls onModeChange when GLOBAL is pressed', () => {
    const onModeChange = jest.fn();
    const { getByText } = render(
      <ModeToggle mode="friends" onModeChange={onModeChange} />
    );

    fireEvent.press(getByText('GLOBAL'));
    expect(onModeChange).toHaveBeenCalledWith('global');
  });

  it('calls onModeChange when FRIENDS is pressed', () => {
    const onModeChange = jest.fn();
    const { getByText } = render(
      <ModeToggle mode="global" onModeChange={onModeChange} />
    );

    fireEvent.press(getByText('FRIENDS'));
    expect(onModeChange).toHaveBeenCalledWith('friends');
  });
});
