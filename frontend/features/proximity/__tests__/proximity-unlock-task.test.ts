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

beforeEach(() => {
  mockSetState.mockClear();
  mockConnect.mockClear();
  mockDisconnect.mockClear();
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
    const { BLEService } = jest.requireMock('@/services/BLEService');
    BLEService.connectedDevices.mockResolvedValueOnce([]);
    BLEService.devices.mockResolvedValueOnce([]);
    await expect(proximityUnlockTask({ mac: 'ZZ:99' })).resolves.toBeUndefined();
    expect(mockSetState).not.toHaveBeenCalled();
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('still disconnects when setState throws', async () => {
    mockSetState.mockRejectedValueOnce(new Error('write failed'));
    await proximityUnlockTask({ mac: 'AA:11' });
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});
