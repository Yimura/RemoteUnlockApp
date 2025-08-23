import { LockState, RemoteUnlockDevice } from '@/ble/RemoteUnlockDevice';
import React from 'react';
import { IconButton } from '../core/IconButton';
import { Lock } from 'lucide-react-native';
import { useDeviceStore } from '@/stores/deviceStore';

interface DeviceLockButtonProps {
    device: RemoteUnlockDevice;
}

export function DeviceLockButton({ device }: DeviceLockButtonProps): React.JSX.Element {
    const { update } = useDeviceStore();

    const lock = async () => {
        try {
            await device.doors.setState(LockState.Locked);
            device.locked = LockState.Locked;
            update(device);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <IconButton disabled={device.locked === LockState.Locked} onPress={lock} icon={<Lock size={16} />} />
    );
}
