import { Device, DeviceId } from 'react-native-ble-plx';
import { create } from 'zustand';

export enum LockState {
    Unknown = 'Unknown',
    Locked = 'Locked',
    Unlocked = 'Unlocked',
}

export class RemoteUnlockDevice {
    ble: Device;
    battery?: number;
    connected: boolean = false;
    locked: LockState = LockState.Unknown;
    lastConnected?: Date;

    constructor(device: Device) {
        this.ble = device;
    }

    async connect(): Promise<boolean> {
        try {
            await this.ble.connect();
        } catch (error) {
            this.connected = false;
            return false;
        }
        this.lastConnected = new Date();
        this.connected = true;
        return true;
    }

    async disconnect(): Promise<void> {
        await this.ble.cancelConnection();
        this.connected = false;
    }
}

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
