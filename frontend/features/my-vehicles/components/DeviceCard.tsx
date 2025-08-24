import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { IconButton } from '@/components/core/IconButton';
import { Settings } from 'lucide-react-native';
import { Card } from '@/components/core/Card';
import { Description, Title } from '@/components/text';
import { BatteryIndicator, ConnectionIndicator, LastSeenIndicator, LockIndicator } from './indicators';
import { useRootNavigation } from '@/hooks/Navigation';
import { RemoteUnlockDevice } from '@/ble/RemoteUnlockDevice';
import { DeviceConnectionToggle } from '@/components/device/DeviceConnectionToggle';
import { DeviceLockButton } from '@/components/device/DeviceLockButton';
import { DeviceUnlockButton } from '@/components/device/DeviceUnlockButton';

export interface DeviceCardProps {
    device: RemoteUnlockDevice;
    style: ViewStyle;
}
export function DeviceCard({ device, style }: DeviceCardProps): React.JSX.Element {
    const navigation = useRootNavigation();

    return (
        <Card style={style}>
            <View style={styles.header}>
                <View>
                    <Title>{device.ble.localName || 'Unknown'}</Title>
                    <Description>BLE Unlock Std • Auto-lock enabled</Description>
                </View>
                <View>
                    <DeviceConnectionToggle device={device} />
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
                    <DeviceUnlockButton device={device} />
                    <DeviceLockButton device={device} />
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
