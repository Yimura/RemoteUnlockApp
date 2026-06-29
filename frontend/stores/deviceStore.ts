import { DeviceId } from 'react-native-ble-plx';
import { create } from 'zustand';
import { RemoteUnlockDevice } from '../ble/RemoteUnlockDevice';
import { DoorServiceUUID } from '../ble/DoorService';
import { BLEService } from '../services/BLEService';

interface DeviceStoreState {
    isRefreshing: boolean;
    hasRefreshed: boolean;

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
    hasRefreshed: false,
    devices: [],

    add: (device) => set(({ devices }) => ({ devices: [...devices, device] })),
    get: (id) => get().devices.find(device => device.ble.id === id),
    remove: (id) => set(({ devices }) => ({ devices: devices.filter(device => device.ble.id !== id) })),
    update: (device) => set(({ devices }) => ({ devices: devices.map(_device => _device.ble.id === device.ble.id && device || _device) })),

    refresh: async () => {
        set({ isRefreshing: true });

        const existing = get().devices;
        for (const dev of existing) {
            await dev.updateStates();
        }

        // Pick up devices the OS already holds a live connection to that
        // advertise our service. New ones get materialized into RemoteUnlock
        // wrappers and immediately probed so the home card shows real data.
        const liveConnected = await BLEService.connectedDevices([DoorServiceUUID]);
        const fresh = liveConnected.filter(
            (raw) => existing.find((known) => known.ble.id === raw.id) === undefined,
        );
        for (const raw of fresh) {
            const wrapper = new RemoteUnlockDevice(raw);
            await wrapper.updateStates();
            get().add(wrapper);
        }

        // Force a re-render so updated wrappers reflect new state fields.
        set((s) => ({
            isRefreshing: false,
            hasRefreshed: true,
            devices: [...s.devices],
        }));
    },
}));
