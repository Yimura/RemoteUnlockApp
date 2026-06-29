import { create } from 'zustand';
import { ProximityConfig } from '../services/proximity-module';

interface State {
    configs: Record<string, ProximityConfig>;
}

interface Actions {
    set: (mac: string, cfg: ProximityConfig) => void;
    remove: (mac: string) => void;
}

export const useProximityStore = create<State & Actions>()((set) => ({
    configs: {},
    set: (mac, cfg) => set((s) => ({ configs: { ...s.configs, [mac]: cfg } })),
    remove: (mac) =>
        set((s) => {
            const rest = { ...s.configs };
            delete rest[mac];
            return { configs: rest };
        }),
}));
