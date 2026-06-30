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

    // Dedupe by ble.id. The pairing flow always calls add() on Pair Now, even
    // when the device was already materialized by refresh() picking it up via
    // BLEService.connectedDevices() — without this guard the same MAC appears
    // twice in the array, triggering React's duplicate-key warning in
    // MyVehiclesPage / any list keyed on ble.id.
    add: (device) => {
        // Spread the array whenever the peripheral indicates a new lock
        // state so subscribed components re-render. Plain mutation of
        // device.locked is invisible to Zustand selectors otherwise.
        device.setOnStateChange((d) => set((s) => ({
            devices: s.devices.map(_d => _d.ble.id === d.ble.id ? d : _d),
        })));
        device.startWatching();
        set(({ devices }) => {
            const idx = devices.findIndex(d => d.ble.id === device.ble.id);
            if (idx === -1) return { devices: [...devices, device] };
            const next = devices.slice();
            next[idx] = device;
            return { devices: next };
        });
    },
    get: (id) => get().devices.find(device => device.ble.id === id),
    remove: (id) => set(({ devices }) => {
        devices.find(d => d.ble.id === id)?.stopWatching();
        return { devices: devices.filter(device => device.ble.id !== id) };
    }),
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
                // ble-plx drops subscriptions on disconnect, so a refresh
                // that reconnects an OS-disconnected device needs to re-arm
                // the DoorLockState monitor or peripheral-initiated changes
                // stop reaching the UI after a single drop/reconnect cycle.
                if (dev.connected) dev.startWatching();
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
