import { create } from 'zustand';

export interface RemoteUnlockDevice {
    mac: string;
    model: string;
    battery: number;
    connected: boolean;
    locked: boolean;
    lastConnected: Date;
}

interface DeviceStoreState {
    devices: RemoteUnlockDevice[];
}

interface DeviceStoreActions {
    add: (device: RemoteUnlockDevice) => void;
    get: (mac: string) => RemoteUnlockDevice | undefined;
    remove: (mac: string) => void;
    update: (device: RemoteUnlockDevice) => void;
}

export const useDeviceStore = create<DeviceStoreState & DeviceStoreActions>()((set, get) => ({
    devices: [],

    add: (device) => set(({ devices }) => ({ devices: [...devices, device] })),
    get: (mac) => get().devices.find(device => device.mac === mac),
    remove: (mac) => set(({ devices }) => ({ devices: devices.filter(device => device.mac !== mac) })),
    update: (device) => set(({ devices }) => ({ devices: devices.map(_device => _device.mac === device.mac && device || _device) })),
}));
