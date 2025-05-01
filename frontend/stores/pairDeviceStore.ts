import { create } from 'zustand';

interface PairDeviceState {
    nextEnabled: boolean;

}

interface PairDeviceActions {
    setNextEnabled: (value: boolean) => void;

}

export const usePairDeviceStore = create<PairDeviceState & PairDeviceActions>()((set) => ({
    nextEnabled: true,
    setNextEnabled: (value) => set(() => ({ nextEnabled: value })),
}));
