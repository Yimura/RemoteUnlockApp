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
        // Re-entrance guard: useOnForegroundFocus fires on mount + every
        // background→foreground transition (e.g. returning from a permission
        // dialog), which can stack two refreshes whose stale `existing`
        // snapshots each add the same OS-connected device. Bail when one is
        // already in flight.
        if (get().isRefreshing) return;

        set({ isRefreshing: true });

        try {
            for (const dev of get().devices) {
                await dev.updateStates();
            }

            // Pick up devices the OS already holds a live connection to that
            // advertise our service. Re-check the store inside the loop so a
            // concurrent path that already materialized the wrapper does not
            // end up with a duplicate.
            const liveConnected = await BLEService.connectedDevices([DoorServiceUUID]);
            for (const raw of liveConnected) {
                if (get().devices.some((known) => known.ble.id === raw.id)) continue;
                const wrapper = new RemoteUnlockDevice(raw);
                await wrapper.updateStates();
                if (get().devices.some((known) => known.ble.id === raw.id)) continue;
                get().add(wrapper);
            }
        } finally {
            // Force a re-render so updated wrappers reflect new state fields.
            set((s) => ({
                isRefreshing: false,
                hasRefreshed: true,
                devices: [...s.devices],
            }));
        }
    },
}));
