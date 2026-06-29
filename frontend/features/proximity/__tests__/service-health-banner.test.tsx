jest.mock('@/features/proximity/services/proximity-module', () => ({
  ProximityModule: { heartbeatAt: jest.fn() },
}));
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  sendIntent: jest.fn(),
}));

import { render, waitFor, cleanup } from '@testing-library/react-native';
import { ServiceHealthBanner } from '@/features/proximity/components/service-health-banner';

beforeEach(() => {
  const { ProximityModule } = jest.requireMock('@/features/proximity/services/proximity-module');
  ProximityModule.heartbeatAt.mockReset();
});

afterEach(() => { cleanup(); });

describe('ServiceHealthBanner', () => {
  it('renders nothing when not enabled', async () => {
    const { queryByText } = render(<ServiceHealthBanner anyEnabled={false} />);
    expect(queryByText(/paused/i)).toBeNull();
  });

  it('renders nothing when heartbeat is fresh', async () => {
    const { ProximityModule } = jest.requireMock('@/features/proximity/services/proximity-module');
    ProximityModule.heartbeatAt.mockResolvedValueOnce(Date.now() - 1000);
    const { queryByText } = render(<ServiceHealthBanner anyEnabled={true} />);
    await waitFor(() => {});
    expect(queryByText(/paused/i)).toBeNull();
  });

  it('shows banner when heartbeat is stale', async () => {
    const { ProximityModule } = jest.requireMock('@/features/proximity/services/proximity-module');
    ProximityModule.heartbeatAt.mockResolvedValueOnce(Date.now() - 10 * 60_000);
    const { findByText } = render(<ServiceHealthBanner anyEnabled={true} />);
    await findByText(/paused/i);
  });
});
