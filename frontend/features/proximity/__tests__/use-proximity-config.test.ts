jest.mock('@/features/proximity/services/proximity-module', () => {
  const cache: Record<string, any> = {};
  return {
    ProximityModule: {
      getConfig: jest.fn(async (mac: string) => cache[mac] ?? {
        enabled: false, mode: 'OFF', enterRssi: -65, exitRssi: -85,
        predictive: true, lookaheadMs: 500, cooldownMs: 60_000, lastManualLockAt: 0,
      }),
      setConfig: jest.fn(async (mac: string, cfg: any) => { cache[mac] = cfg; }),
    },
  };
});

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProximityConfig } from '@/features/proximity/hooks/use-proximity-config';

describe('useProximityConfig', () => {
  it('loads then saves a partial update', async () => {
    const { result } = renderHook(() => useProximityConfig('AA:BB'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.config?.mode).toBe('OFF');
    await act(async () => {
      await result.current.save({ enabled: true, mode: 'AUTO' });
    });
    expect(result.current.config?.mode).toBe('AUTO');
    expect(result.current.config?.enabled).toBe(true);
  });
});
