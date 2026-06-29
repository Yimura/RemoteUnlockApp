jest.mock('@/features/proximity/services/proximity-module', () => ({
  ProximityModule: {
    getConfig: jest.fn(async () => ({
      enabled: false, mode: 'OFF',
      enterRssi: -65, exitRssi: -85,
      predictive: true, lookaheadMs: 500,
      cooldownMs: 60_000, lastManualLockAt: 0,
    })),
    setConfig: jest.fn(async () => {}),
    captureRssi: jest.fn(async () => ({ rssi: -67, stddev: 2.1, count: 25 })),
  },
}));

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ProximitySettingsPage } from '@/features/proximity/pages/proximity-settings-page';

const route: any = { params: { mac: 'AA:BB:CC:DD:EE:FF' } };
const navigation: any = { goBack: jest.fn() };

describe('ProximitySettingsPage', () => {
  it('renders modes and saves on selection', async () => {
    const { getByText } = render(<ProximitySettingsPage route={route} navigation={navigation} />);
    await waitFor(() => getByText('Auto'));
    fireEvent.press(getByText('Auto'));
    const { ProximityModule } = jest.requireMock('@/features/proximity/services/proximity-module');
    await waitFor(() =>
      expect(ProximityModule.setConfig).toHaveBeenCalledWith(
        'AA:BB:CC:DD:EE:FF',
        expect.objectContaining({ mode: 'AUTO', enabled: true })
      )
    );
  });
});
