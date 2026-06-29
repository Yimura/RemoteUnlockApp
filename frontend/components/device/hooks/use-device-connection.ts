import { useCallback, useState } from 'react';
import type { RemoteUnlockDevice } from '@/ble/RemoteUnlockDevice';
import { useDeviceStore } from '@/stores/deviceStore';

type UseDeviceConnectionReturn = {
    isLoading: boolean;
    toggle: () => Promise<void>;
};

export const useDeviceConnection = (device: RemoteUnlockDevice): UseDeviceConnectionReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const update = useDeviceStore((state) => state.update);

    const toggle = useCallback(async () => {
        setIsLoading(true);
        try {
            if (await device.ble.isConnected()) {
                await device.disconnect();
            } else {
                await device.connect();
            }
            update(device);
        } finally {
            setIsLoading(false);
        }
    }, [device, update]);

    return { isLoading, toggle };
};
