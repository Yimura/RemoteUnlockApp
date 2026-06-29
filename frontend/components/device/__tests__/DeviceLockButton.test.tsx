jest.mock('@/features/proximity', () => ({
  ProximityModule: {
    recordManualLock: jest.fn(async () => {}),
  },
}));

jest.mock('@/stores/deviceStore', () => ({
  useDeviceStore: jest.fn(),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LockState } from '@/ble/RemoteUnlockDevice';
import { DeviceLockButton } from '../DeviceLockButton';
import { useDeviceStore } from '@/stores/deviceStore';

const mockUpdate = jest.fn();

const mockDevice = {
  ble: { id: 'AA:BB:CC:DD:EE:FF' },
  locked: LockState.Unlocked,
  doors: {
    setState: jest.fn(async () => {}),
  },
} as any;

beforeEach(() => {
  jest.clearAllMocks();
  mockDevice.locked = LockState.Unlocked;
  (useDeviceStore as unknown as jest.Mock).mockReturnValue({ update: mockUpdate });
});

describe('DeviceLockButton', () => {
  it('calls setState, recordManualLock, and update on press', async () => {
    const { ProximityModule } = jest.requireMock('@/features/proximity');

    const { UNSAFE_getByType } = render(<DeviceLockButton device={mockDevice} />);
    const { Pressable } = require('react-native');
    fireEvent.press(UNSAFE_getByType(Pressable));

    await waitFor(() => {
      expect(mockDevice.doors.setState).toHaveBeenCalledWith(LockState.Locked);
      expect(ProximityModule.recordManualLock).toHaveBeenCalledWith('AA:BB:CC:DD:EE:FF');
      expect(mockUpdate).toHaveBeenCalledWith(mockDevice);
    });
  });

  it('does not record manual lock when setState rejects', async () => {
    const { ProximityModule } = jest.requireMock('@/features/proximity');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockDevice.doors.setState.mockRejectedValueOnce(new Error('BLE write failed'));

    const { UNSAFE_getByType } = render(<DeviceLockButton device={mockDevice} />);
    const { Pressable } = require('react-native');
    fireEvent.press(UNSAFE_getByType(Pressable));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    expect(ProximityModule.recordManualLock).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockDevice.locked).toBe(LockState.Unlocked);

    consoleSpy.mockRestore();
  });
});
