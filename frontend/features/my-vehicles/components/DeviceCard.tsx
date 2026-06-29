import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';
import {
    BatteryCharging,
    BatteryFull,
    BatteryLow,
    BatteryMedium,
    Car,
    ChevronRight,
    Clock4,
    Lock,
    Plug,
    Settings,
    Unlock,
    Wifi,
    WifiOff,
} from 'lucide-react-native';
import { Card } from '@/components/core/Card';
import { Button } from '@/components/core/Button';
import { Description, Title } from '@/components/text';
import { LockState, RemoteUnlockDevice } from '@/ble/RemoteUnlockDevice';
import { useDeviceStore } from '@/stores/deviceStore';
import { useDeviceConnection } from '@/components/device/hooks';
import { useRootNavigation } from '@/hooks';
import { ProximityModule } from '@/features/proximity';
import { Color } from '@/theme/Color';
import { BorderColor, SmallTextColor, TextColor } from '@/theme/Theme';
import { GetTimeAgoShort } from '@/util/Time';

export interface DeviceCardProps {
    device: RemoteUnlockDevice;
    style?: ViewStyle;
}

export function DeviceCard({ device, style }: DeviceCardProps): React.JSX.Element {
    const navigation = useRootNavigation();
    const { update } = useDeviceStore();
    const { isLoading: isConnecting, toggle: toggleConnection } = useDeviceConnection(device);

    const unlock = async () => {
        try {
            await device.doors.setState(LockState.Unlocked);
            device.locked = LockState.Unlocked;
            update(device);
        } catch (error) {
            console.error(error);
        }
    };
    const lock = async () => {
        try {
            await device.doors.setState(LockState.Locked);
            device.locked = LockState.Locked;
            update(device);
            await ProximityModule.recordManualLock(device.ble.id);
        } catch (error) {
            console.error(error);
        }
    };

    const battery = batteryView(device.battery);
    const lockPill = lockPillView(device.locked);

    return (
        <Card style={[styles.card, style]}>
            <View style={styles.header}>
                <View style={styles.iconWrap}>
                    <Car size={22} color={Color.Blue} />
                </View>
                <View style={styles.headerText}>
                    <Title numberOfLines={1}>{device.ble.localName || 'Unknown'}</Title>
                    <Description numberOfLines={1}>BLE remote unlock</Description>
                </View>
                <View style={[styles.lockPill, { backgroundColor: lockPill.bg, borderColor: lockPill.fg }]}>
                    <Text style={[styles.lockPillTxt, { color: lockPill.fg }]}>{lockPill.label}</Text>
                </View>
            </View>

            <View style={styles.statusGrid}>
                <View style={styles.statusCell}>
                    {device.connected
                        ? <Wifi size={16} color={Color.Green} />
                        : <WifiOff size={16} color={Color.Grey} />}
                    <Text style={styles.statusValue} numberOfLines={1}>
                        {device.connected ? 'Online' : 'Offline'}
                    </Text>
                    <Text style={styles.statusSub} numberOfLines={1}>Connection</Text>
                </View>
                <View style={styles.statusCell}>
                    {React.cloneElement(battery.icon, { size: 16 })}
                    <Text style={[styles.statusValue, { color: battery.color }]} numberOfLines={1}>
                        {battery.label}
                    </Text>
                    <Text style={styles.statusSub} numberOfLines={1}>Battery</Text>
                </View>
                <View style={styles.statusCell}>
                    <Clock4 size={16} color={SmallTextColor} />
                    <Text style={styles.statusValue} numberOfLines={1}>
                        {device.lastConnected ? GetTimeAgoShort(device.lastConnected) : '—'}
                    </Text>
                    <Text style={styles.statusSub} numberOfLines={1}>Last seen</Text>
                </View>
            </View>

            {device.connected ? (
                <View style={styles.actionRow}>
                    <Button
                        onPress={unlock}
                        disabled={device.locked === LockState.Unlocked}
                        style={({ pressed }) => StyleSheet.flatten([
                            styles.unlockBtn,
                            pressed && device.locked !== LockState.Unlocked ? styles.unlockBtnPressed : null,
                        ])}>
                        <Unlock size={18} color={Color.White} />
                        <Text style={styles.actionBtnTxt}>Unlock</Text>
                    </Button>
                    <Button
                        onPress={lock}
                        disabled={device.locked === LockState.Locked}
                        style={({ pressed }) => StyleSheet.flatten([
                            styles.lockBtn,
                            pressed && device.locked !== LockState.Locked ? styles.lockBtnPressed : null,
                        ])}>
                        <Lock size={18} color={Color.White} />
                        <Text style={styles.actionBtnTxt}>Lock</Text>
                    </Button>
                </View>
            ) : (
                <Button
                    onPress={toggleConnection}
                    disabled={isConnecting}
                    style={({ pressed }) => StyleSheet.flatten([
                        styles.connectBtn,
                        pressed && !isConnecting ? styles.connectBtnPressed : null,
                    ])}>
                    {isConnecting
                        ? <ActivityIndicator size={18} color={Color.White} />
                        : <>
                            <Plug size={16} color={Color.White} />
                            <Text style={styles.actionBtnTxt}>Connect</Text>
                        </>}
                </Button>
            )}

            <Button
                onPress={() => navigation.navigate('Device Settings', { id: device.ble.id })}
                style={({ pressed }) => StyleSheet.flatten([
                    styles.settingsRow,
                    pressed ? styles.settingsRowPressed : null,
                ])}>
                <Settings size={16} color={SmallTextColor} />
                <Text style={styles.settingsTxt}>Device settings</Text>
                <ChevronRight size={18} color={SmallTextColor} />
            </Button>
        </Card>
    );
}

const ORANGE_TINT = 'rgba(217, 119, 6, 0.12)';

function lockPillView(state: LockState) {
    switch (state) {
        case LockState.Locked:   return { label: 'Locked',   fg: Color.Blue,   bg: Color.WashedBlue };
        case LockState.Unlocked: return { label: 'Unlocked', fg: Color.Orange, bg: ORANGE_TINT };
        default:                 return { label: 'Unknown',  fg: Color.Grey,   bg: Color.BrokenWhite };
    }
}

function batteryView(v?: number): { icon: React.JSX.Element; label: string; color: string } {
    if (!v) {
        const color: string = Color.Grey;
        return { icon: <BatteryCharging size={14} color={color} />, label: '?.?V', color };
    }
    let color: string = Color.Green;
    let icon = <BatteryFull size={14} color={color} />;
    if (v < 10.8) {
        color = Color.Red;
        icon = <BatteryLow size={14} color={color} />;
    } else if (v < 11.5) {
        color = Color.Orange;
        icon = <BatteryMedium size={14} color={color} />;
    } else if (v < 13) {
        color = Color.Green;
        icon = <BatteryFull size={14} color={color} />;
    }
    return { icon, label: `${Math.round(v * 10) / 10}V`, color };
}

const styles = StyleSheet.create({
    card: {
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Color.FadedBlue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,
    },
    lockPill: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    lockPillTxt: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    statusCell: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: BorderColor,
        backgroundColor: Color.OffWhite,
    },
    statusValue: {
        color: TextColor,
        fontSize: 13,
        fontWeight: '600',
    },
    statusSub: {
        color: SmallTextColor,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    unlockBtn: {
        flex: 1,
        backgroundColor: Color.Orange,
        borderColor: Color.Orange,
        paddingVertical: 12,
    },
    unlockBtnPressed: {
        backgroundColor: 'rgb(184, 100, 6)',
        borderColor: 'rgb(184, 100, 6)',
    },
    lockBtn: {
        flex: 1,
        backgroundColor: Color.Blue,
        borderColor: Color.Blue,
        paddingVertical: 12,
    },
    lockBtnPressed: {
        backgroundColor: Color.OffBlue,
        borderColor: Color.OffBlue,
    },
    connectBtn: {
        backgroundColor: Color.Blue,
        borderColor: Color.Blue,
        paddingVertical: 12,
    },
    connectBtnPressed: {
        backgroundColor: Color.OffBlue,
        borderColor: Color.OffBlue,
    },
    actionBtnTxt: {
        color: Color.White,
        fontWeight: '700',
        fontSize: 15,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 0,
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderTopWidth: 1,
        borderTopColor: BorderColor,
        borderRadius: 0,
        paddingTop: 12,
        justifyContent: 'flex-start',
    },
    settingsRowPressed: {
        backgroundColor: Color.OffWhite,
    },
    settingsTxt: {
        flex: 1,
        color: SmallTextColor,
        fontWeight: '600',
        textAlign: 'left',
    },
});
