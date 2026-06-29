import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
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
    const isLocked = device.locked === LockState.Locked;
    const isUnlocked = device.locked === LockState.Unlocked;

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
                <View style={styles.lockSwitch}>
                    <Pressable
                        onPress={lock}
                        disabled={isLocked}
                        style={({ pressed }) => StyleSheet.flatten([
                            styles.switchHalf,
                            isLocked ? styles.switchHalfLockActive : null,
                            pressed && !isLocked ? styles.switchHalfPressed : null,
                        ])}>
                        <Lock size={16} color={isLocked ? Color.White : SmallTextColor} />
                        <Text style={[
                            styles.switchTxt,
                            isLocked ? styles.switchTxtActive : styles.switchTxtMuted,
                        ]}>
                            {isLocked ? 'Locked' : 'Lock'}
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={unlock}
                        disabled={isUnlocked}
                        style={({ pressed }) => StyleSheet.flatten([
                            styles.switchHalf,
                            isUnlocked ? styles.switchHalfUnlockActive : null,
                            pressed && !isUnlocked ? styles.switchHalfPressed : null,
                        ])}>
                        <Unlock size={16} color={isUnlocked ? Color.White : SmallTextColor} />
                        <Text style={[
                            styles.switchTxt,
                            isUnlocked ? styles.switchTxtActive : styles.switchTxtMuted,
                        ]}>
                            {isUnlocked ? 'Unlocked' : 'Unlock'}
                        </Text>
                    </Pressable>
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
    lockSwitch: {
        flexDirection: 'row',
        backgroundColor: Color.OffWhite,
        borderWidth: 1,
        borderColor: BorderColor,
        borderRadius: 999,
        padding: 4,
        gap: 4,
    },
    switchHalf: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 999,
    },
    switchHalfLockActive: {
        backgroundColor: Color.Blue,
    },
    switchHalfUnlockActive: {
        backgroundColor: Color.Orange,
    },
    switchHalfPressed: {
        backgroundColor: Color.BrokenWhite,
    },
    switchTxt: {
        fontWeight: '700',
        fontSize: 14,
    },
    switchTxtActive: {
        color: Color.White,
    },
    switchTxtMuted: {
        color: SmallTextColor,
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
