import { NativeModules, Platform } from 'react-native';

export type Mode = 'OFF' | 'CONFIRM' | 'AUTO';

export interface ProximityConfig {
    enabled: boolean;
    mode: Mode;
    enterRssi: number;
    exitRssi: number;
    predictive: boolean;
    lookaheadMs: number;
    cooldownMs: number;
    lastManualLockAt: number;
}

export interface CalibrationResult {
    rssi: number;
    stddev: number;
    count: number;
}

interface Native {
    getConfig(mac: string): Promise<ProximityConfig>;
    setConfig(mac: string, cfg: ProximityConfig): Promise<void>;
    removeConfig(mac: string): Promise<void>;
    recordManualLock(mac: string): Promise<void>;
    startService(): Promise<void>;
    stopService(): Promise<void>;
    heartbeatAt(): Promise<number>;
    captureRssi(mac: string, durationMs: number): Promise<CalibrationResult>;
}

const NoopNative: Native = {
    getConfig: async () => ({
        enabled: false, mode: 'OFF',
        enterRssi: -65, exitRssi: -85,
        predictive: true, lookaheadMs: 500,
        cooldownMs: 60_000, lastManualLockAt: 0,
    }),
    setConfig: async () => {},
    removeConfig: async () => {},
    recordManualLock: async () => {},
    startService: async () => {},
    stopService: async () => {},
    heartbeatAt: async () => 0,
    captureRssi: async () => ({ rssi: -100, stddev: 0, count: 0 }),
};

export const ProximityModule: Native =
    Platform.OS === 'android'
        ? (NativeModules.ProximityModule as Native)
        : NoopNative;
