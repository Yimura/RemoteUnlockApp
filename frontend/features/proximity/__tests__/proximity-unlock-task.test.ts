const mockDevice = {
  id: 'AA:11',
  cancelConnection: jest.fn(),
  connect: jest.fn(),
  discoverAllServicesAndCharacteristics: jest.fn(),
  writeCharacteristicWithResponseForService: jest.fn(),
};

jest.mock('@/services/BLEService', () => ({
  BLEService: {
    connectedDevices: jest.fn(async () => [mockDevice]),
    devices: jest.fn(async () => []),
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(async () => undefined),
  },
}));

jest.mock('@/features/proximity', () => ({
  ProximityModule: {
    getBondState: jest.fn(async () => 'BONDED'),
    createBond: jest.fn(async () => true),
  },
}));

const mockSetState = jest.fn(async () => undefined);
const mockConnect = jest.fn(async function (this: any) { this.connected = true; return true; });
const mockDisconnect = jest.fn(async function (this: any) { this.connected = false; });

jest.mock('@/ble/RemoteUnlockDevice', () => {
  const real = jest.requireActual('@/ble/RemoteUnlockDevice');
  return {
    ...real,
    RemoteUnlockDevice: class {
      ble = mockDevice;
      connected = false;
      doors = { setState: mockSetState };
      connect = mockConnect;
      disconnect = mockDisconnect;
    },
  };
});

import { proximityUnlockTask } from '@/features/proximity/headless/proximity-unlock-task';
import { LockState } from '@/ble/RemoteUnlockDevice';

function getBLEMock() {
  return jest.requireMock('@/services/BLEService').BLEService as {
    connectedDevices: jest.Mock;
    devices: jest.Mock;
    startDeviceScan: jest.Mock;
    stopDeviceScan: jest.Mock;
  };
}

let warnSpy: jest.SpyInstance;

beforeEach(() => {
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  mockSetState.mockClear();
  mockConnect.mockClear();
  mockDisconnect.mockClear();
  const ble = getBLEMock();
  ble.connectedDevices.mockReset();
  ble.devices.mockReset();
  ble.startDeviceScan.mockReset();
  ble.stopDeviceScan.mockReset();
  ble.connectedDevices.mockResolvedValue([mockDevice]);
  ble.devices.mockResolvedValue([]);
  ble.stopDeviceScan.mockResolvedValue(undefined);
});

afterEach(() => {
  warnSpy.mockRestore();
});

describe('proximityUnlockTask', () => {
  it('connects, sets state to Unlocked, disconnects', async () => {
    await proximityUnlockTask({ mac: 'AA:11' });
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockSetState).toHaveBeenCalledTimes(1);
    expect(mockSetState).toHaveBeenCalledWith(LockState.Unlocked);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('does not unlock or throw when no device found', async () => {
    const ble = getBLEMock();
    ble.connectedDevices.mockResolvedValue([]);
    ble.devices.mockResolvedValue([]);
    // startDeviceScan calls cb with error so the settle(null) path is exercised
    // without waiting for the real 5-second timeout.
    ble.startDeviceScan.mockImplementation((_uuids: any, _opts: any, cb: any) => {
      cb(new Error('scan failed'), null);
    });
    await proximityUnlockTask({ mac: 'ZZ:99' });
    expect(mockSetState).not.toHaveBeenCalled();
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('still disconnects when setState throws', async () => {
    mockSetState.mockRejectedValueOnce(new Error('write failed'));
    await proximityUnlockTask({ mac: 'AA:11' });
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('falls back to startDeviceScan when device not in known list', async () => {
    const ble = getBLEMock();
    ble.connectedDevices.mockResolvedValue([]);
    ble.devices.mockResolvedValue([]);
    // synchronously call cb so the promise resolves immediately
    ble.startDeviceScan.mockImplementationOnce((_uuids: any, _opts: any, cb: any) => {
      cb(null, mockDevice);
    });
    await proximityUnlockTask({ mac: 'AA:11' });
    expect(mockSetState).toHaveBeenCalledWith(LockState.Unlocked);
    expect(ble.stopDeviceScan).toHaveBeenCalled();
  });
});
