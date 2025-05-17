import React, { useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { IconButton } from '../core/IconButton';
import { Lock, Settings, Unlock } from 'lucide-react-native';
import { Card } from '../core/Card';
import { useNavigation } from '@react-navigation/native';
import { Description, Title } from '../text';
import { LoadingButton } from '../core/LoadingButton';
import { RemoteUnlockDevice, useDeviceStore } from '../../stores/deviceStore';
import { BatteryIndicator, ConnectionIndicator, LastSeenIndicator, LockIndicator } from './indicators';

export interface VehicleCardProps {
    device: RemoteUnlockDevice;
    style: ViewStyle;
}
export function VehicleCard({ device, style }: VehicleCardProps): React.JSX.Element {
    const navigator = useNavigation();
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
                    <IconButton icon={<Unlock size={16} />} />
                    <IconButton icon={<Lock size={16} />} />
                </View>
            </View>
            <View>
                <IconButton icon={<Settings size={16} />} label="Device Settings" onPress={() => navigator.navigate('Device Settings', { id: device.ble.id })} />
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
