import { useEffect, useState, useCallback } from 'react';
import { ProximityModule, ProximityConfig } from '../services/proximity-module';
import { useProximityStore } from '../stores/proximity-store';

export function useProximityConfig(mac: string) {
    const cached = useProximityStore((s) => s.configs[mac]);
    const setStore = useProximityStore((s) => s.set);
    const [loading, setLoading] = useState(!cached);

    const reload = useCallback(async () => {
        setLoading(true);
        const cfg = await ProximityModule.getConfig(mac);
        setStore(mac, cfg);
        setLoading(false);
    }, [mac, setStore]);

    useEffect(() => {
        if (!cached) {
            reload();
        }
    }, [cached, reload]);

    const save = useCallback(async (partial: Partial<ProximityConfig>) => {
        const current = cached ?? await ProximityModule.getConfig(mac);
        const next: ProximityConfig = { ...current, ...partial };
        await ProximityModule.setConfig(mac, next);
        setStore(mac, next);
    }, [mac, cached, setStore]);

    return { config: cached, loading, save, reload };
}
