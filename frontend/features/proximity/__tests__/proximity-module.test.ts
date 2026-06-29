jest.mock('react-native', () => ({
  NativeModules: {
    ProximityModule: {
      getConfig: jest.fn(),
      setConfig: jest.fn(),
      removeConfig: jest.fn(),
      recordManualLock: jest.fn(),
      startService: jest.fn(),
      stopService: jest.fn(),
      heartbeatAt: jest.fn(),
      captureRssi: jest.fn(),
    },
  },
  Platform: { OS: 'android', Version: 33 },
}));

import { NativeModules } from 'react-native';
import { ProximityModule } from '@/features/proximity/services/proximity-module';

describe('ProximityModule', () => {
  it('forwards getConfig', async () => {
    (NativeModules.ProximityModule.getConfig as jest.Mock).mockResolvedValue({
      enabled: true, mode: 'AUTO', enterRssi: -65, exitRssi: -85,
      predictive: true, lookaheadMs: 500, cooldownMs: 60000, lastManualLockAt: 0,
    });
    const cfg = await ProximityModule.getConfig('AA');
    expect(cfg.mode).toBe('AUTO');
    expect(NativeModules.ProximityModule.getConfig).toHaveBeenCalledWith('AA');
  });
});
