import { useCallback, useState } from 'react';
import type { RemoteUnlockDevice } from '@/ble/RemoteUnlockDevice';

type UseSaveDeviceNameReturn = {
    isSaving: boolean;
    error: unknown;
    save: (name: string) => Promise<boolean>;
};

export const useSaveDeviceName = (device: RemoteUnlockDevice): UseSaveDeviceNameReturn => {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const save = useCallback(async (name: string): Promise<boolean> => {
        setIsSaving(true);
        setError(null);
        try {
            const ok = await device.settings.setName(name);
            return ok;
        } catch (err) {
            setError(err);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [device]);

    return { isSaving, error, save };
};
