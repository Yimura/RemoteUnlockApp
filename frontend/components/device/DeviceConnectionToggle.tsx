import { RemoteUnlockDevice } from '@/ble/RemoteUnlockDevice';
import { useDeviceStore } from '@/stores/deviceStore';
import React, { useState } from 'react';
import { LoadingButton } from '../core/LoadingButton';

interface DeviceConnectionToggleProps {
    device: RemoteUnlockDevice;
}
export function DeviceConnectionToggle({ device }: DeviceConnectionToggleProps): React.JSX.Element {
    const [isLoading, setIsLoading] = useState(false);
    const { update } = useDeviceStore();

    const toggleConnection = async () => {
        setIsLoading(true);
        if (!await device.ble.isConnected()) {
            await device.connect();
        }
        else {
            await device.disconnect();
        }
        update(device);
        setIsLoading(false);
    };

    return (
        <LoadingButton
            label={device.connected ? 'Disconnect' : 'Connect'}
            isLoading={isLoading}
            onPress={toggleConnection} />
    );
}
