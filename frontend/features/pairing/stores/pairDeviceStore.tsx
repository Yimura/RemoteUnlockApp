import { create } from 'zustand';
import { Device } from 'react-native-ble-plx';


interface PairDeviceState {
    selectedDevice: Device | null;
}

interface PairDeviceActions {
    selectDevice: (device: Device) => void;

    reset: () => void;
}

const defaults: PairDeviceState = {
    selectedDevice: null,
};

export const usePairDeviceStore = create<PairDeviceState & PairDeviceActions>()((set) => ({
    ...defaults,

    selectDevice: (device) => set({ selectedDevice: device }),
    reset: () => set(defaults),
}));
