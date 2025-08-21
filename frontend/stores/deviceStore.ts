import { DeviceId } from 'react-native-ble-plx';
import { create } from 'zustand';
import { RemoteUnlockDevice } from '../ble/RemoteUnlockDevice';
import { BLEService } from '../services/BLEService';

interface DeviceStoreState {
    isRefreshing: boolean;

    devices: RemoteUnlockDevice[];
}

interface DeviceStoreActions {
    add: (device: RemoteUnlockDevice) => void;
    get: (id: DeviceId) => RemoteUnlockDevice | undefined;
    remove: (id: DeviceId) => void;
    update: (device: RemoteUnlockDevice) => void;

    refresh: () => Promise<void>;
}

export const useDeviceStore = create<DeviceStoreState & DeviceStoreActions>()((set, get) => ({
    isRefreshing: false,
    devices: [],

    add: (device) => set(({ devices }) => ({ devices: [...devices, device] })),
    get: (id) => get().devices.find(device => device.ble.id === id),
    remove: (id) => set(({ devices }) => ({ devices: devices.filter(device => device.ble.id !== id) })),
    update: (device) => set(({ devices }) => ({ devices: devices.map(_device => _device.ble.id === device.ble.id && device || _device) })),

    refresh: async () => {
        const { add, devices } = get();

        set({ isRefreshing: true });
        for (const existingDevices of devices) {
            await existingDevices.updateStates();
        }

        const connectedDevices = await BLEService.connectedDevices(['7ccf30e3-a9af-45b2-8d1d-f58e4d30ff95']);
        const unknownConnectedDevices = connectedDevices.filter((device) => devices.find(_dev => device.id === _dev.ble.id) === undefined);
        for (const newDevice of unknownConnectedDevices) {
            add(new RemoteUnlockDevice(newDevice));
        }

        set({ isRefreshing: false });
    },
}));
