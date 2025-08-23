import { LockState, RemoteUnlockDevice } from '@/ble/RemoteUnlockDevice';
import React from 'react';
import { IconButton } from '../core/IconButton';
import { Unlock } from 'lucide-react-native';
import { useDeviceStore } from '@/stores/deviceStore';

interface DeviceUnlockButtonProps {
    device: RemoteUnlockDevice;
}

export function DeviceUnlockButton({ device }: DeviceUnlockButtonProps): React.JSX.Element {
    const { update } = useDeviceStore();

    const unlock = async () => {
        try {
            await device.doors.setState(LockState.Unlocked);
            device.locked = LockState.Unlocked;
            update(device);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <IconButton disabled={device.locked === LockState.Unlocked} onPress={unlock} icon={<Unlock size={16} />} />
    );
}
