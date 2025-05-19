import React, { useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { IconButton } from '../core/IconButton';
import { Lock, Settings, Unlock } from 'lucide-react-native';
import { Card } from '../core/Card';
import { Description, Title } from '../text';
import { LoadingButton } from '../core/LoadingButton';
import { useDeviceStore } from '../../stores/deviceStore';
import { BatteryIndicator, ConnectionIndicator, LastSeenIndicator, LockIndicator } from './indicators';
import { useRootNavigation } from '../../hooks/Navigation';
import { LockState, RemoteUnlockDevice } from '../../ble/RemoteUnlockDevice';

export interface VehicleCardProps {
    device: RemoteUnlockDevice;
    style: ViewStyle;
}
export function VehicleCard({ device, style }: VehicleCardProps): React.JSX.Element {
    const navigation = useRootNavigation();
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

    const lock = async () => {
        try {
            await device.doors.setState(LockState.Locked);
            device.locked = LockState.Locked;
            update(device);
        } catch (error) {
            console.error(error);
        }
    };

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
        <Card style={style}>
            <View style={styles.header}>
                <View>
                    <Title>{device.ble.localName || 'Unknown'}</Title>
                    <Description>BLE Unlock Std • Auto-lock enabled</Description>
                </View>
                <View>
                    <LoadingButton label={device.connected ? 'Disconnect' : 'Connect'} isLoading={isLoading} onPress={toggleConnection} />
                </View>
            </View>
            <View style={styles.quickInfo}>
                <View>
                    <ConnectionIndicator connected={device.connected} />
                    <LockIndicator locked={device.locked} />
                    <BatteryIndicator battery={device.battery} />
                    <LastSeenIndicator date={device.lastConnected} />
                </View>
                <View style={styles.lockButtons}>
                    <IconButton onPress={unlock} icon={<Unlock size={16} />} />
                    <IconButton onPress={lock} icon={<Lock size={16} />} />
                </View>
            </View>
            <View>
                <IconButton icon={<Settings size={16} />} label="Device Settings" onPress={() => navigation.navigate('Device Settings', { id: device.ble.id })} />
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quickInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
    },
    lockButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});
