import React from 'react';
import { LoadingButton } from '../core/LoadingButton';
import type { RemoteUnlockDevice } from '@/ble/RemoteUnlockDevice';
import { useDeviceConnection } from './hooks';

interface DeviceConnectionToggleProps {
    device: RemoteUnlockDevice;
}

export function DeviceConnectionToggle({ device }: DeviceConnectionToggleProps): React.JSX.Element {
    const { isLoading, toggle } = useDeviceConnection(device);

    return (
        <LoadingButton
            label={device.connected ? 'Disconnect' : 'Connect'}
            isLoading={isLoading}
            onPress={toggle}
        />
    );
}
