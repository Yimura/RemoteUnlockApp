import { DeviceId } from 'react-native-ble-plx';
import { create } from 'zustand';
import { RemoteUnlockDevice } from '../ble/RemoteUnlockDevice';

interface DeviceStoreState {
    devices: RemoteUnlockDevice[];
}

interface DeviceStoreActions {
    add: (device: RemoteUnlockDevice) => void;
    get: (id: DeviceId) => RemoteUnlockDevice | undefined;
    remove: (id: DeviceId) => void;
    update: (device: RemoteUnlockDevice) => void;
}

export const useDeviceStore = create<DeviceStoreState & DeviceStoreActions>()((set, get) => ({
    devices: [],

    add: (device) => set(({ devices }) => ({ devices: [...devices, device] })),
    get: (id) => get().devices.find(device => device.ble.id === id),
    remove: (id) => set(({ devices }) => ({ devices: devices.filter(device => device.ble.id !== id) })),
    update: (device) => set(({ devices }) => ({ devices: devices.map(_device => _device.ble.id === device.ble.id && device || _device) })),
}));
