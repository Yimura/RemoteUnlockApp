jest.mock('@/features/proximity/services/proximity-module', () => ({
  ProximityModule: {
    captureRssi: jest.fn(async () => ({ rssi: -67, stddev: 2.1, count: 25 })),
  },
}));

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CalibrationModal } from '@/features/proximity/components/calibration-modal';

describe('CalibrationModal', () => {
  it('captures rssi and offers save', async () => {
    const onSave = jest.fn();
    const { getByText } = render(
      <CalibrationModal mac="AA" kind="enter" onClose={() => {}} onSave={onSave} />
    );
    fireEvent.press(getByText('Start capture'));
    await waitFor(() => getByText('-67 dBm'));
    fireEvent.press(getByText('Save'));
    expect(onSave).toHaveBeenCalledWith(-67);
  });

  it('shows retry on noisy capture', async () => {
    const { ProximityModule } = jest.requireMock('@/features/proximity/services/proximity-module');
    ProximityModule.captureRssi.mockResolvedValueOnce({ rssi: -67, stddev: 12, count: 25 });
    const { getByText } = render(
      <CalibrationModal mac="AA" kind="enter" onClose={() => {}} onSave={() => {}} />
    );
    fireEvent.press(getByText('Start capture'));
    await waitFor(() => getByText(/noisy/i));
  });
});
