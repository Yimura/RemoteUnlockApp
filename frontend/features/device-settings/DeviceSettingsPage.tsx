import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '../../components/core/Card';
import { Color } from '../../theme/Color';
import { Description, Title } from '../../components/text';
import { Button } from '../../components/core/Button';
import { useDeviceStore } from '../../stores/deviceStore';
import { RemoveDevice } from './components';
import { DeviceConnectionToggle } from '@/components/device';
import { useSaveDeviceName } from './hooks';
import { useRootNavigation } from '@/hooks';
import { BorderColor, SmallTextColor, TextColor } from '@/theme/Theme';
import { LockState } from '@/ble/RemoteUnlockDevice';
import { ProximityModule, type BondState } from '@/features/proximity';

interface DeviceSettingsPageRoute {
    route: {
        params: {
            id: string
        }
    }
}

export function DeviceSettingsPage({ route }: DeviceSettingsPageRoute): React.JSX.Element {
    const { get } = useDeviceStore();
    const device = get(route.params.id)!;

    const initialName = device?.ble.localName || 'Unknown';
    const [deviceName, setDeviceName] = useState(initialName);

    const { save, isSaving } = useSaveDeviceName(device);
    const nav = useRootNavigation();

    const nameDirty = deviceName !== initialName && deviceName.trim().length > 0;

    const onSaveName = () => {
        save(deviceName);
    };

    const connectionLabel = device.connected ? 'Connected' : 'Disconnected';
    const lockLabel =
        device.locked === LockState.Locked ? 'Locked' :
        device.locked === LockState.Unlocked ? 'Unlocked' : 'Unknown';

    const [bondState, setBondState] = useState<BondState>('UNKNOWN');
    const [bonding, setBonding] = useState(false);
    const refreshBond = useCallback(async () => {
        const s = await ProximityModule.getBondState(device.ble.id);
        setBondState(s);
    }, [device.ble.id]);
    useEffect(() => { refreshBond(); }, [refreshBond]);
    const repair = async () => {
        setBonding(true);
        try {
            await ProximityModule.createBond(device.ble.id);
        } finally {
            setBonding(false);
            refreshBond();
        }
    };
    const bondColor =
        bondState === 'BONDED'  ? Color.Green :
        bondState === 'BONDING' ? Color.Orange :
        bondState === 'NONE'    ? Color.Red : Color.Grey;
    const bondLabel =
        bondState === 'BONDED'  ? 'Paired' :
        bondState === 'BONDING' ? 'Pairing…' :
        bondState === 'NONE'    ? 'Not paired' : 'Unknown';

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <View>
                    <Title>Device</Title>
                    <Description>Identify and manage this paired vehicle.</Description>
                </View>

                <View style={styles.statusGrid}>
                    <View style={styles.statusCell}>
                        <Text style={styles.statusLabel}>Status</Text>
                        <View style={styles.statusValueRow}>
                            <View style={[
                                styles.statusDot,
                                { backgroundColor: device.connected ? Color.Green : Color.Grey },
                            ]} />
                            <Text style={styles.statusValue}>{connectionLabel}</Text>
                        </View>
                    </View>
                    <View style={styles.statusCell}>
                        <Text style={styles.statusLabel}>Lock state</Text>
                        <Text style={styles.statusValue}>{lockLabel}</Text>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.rowText}>
                        <Text style={styles.fieldLabel}>Connection</Text>
                        <Description>Toggle BLE connection on demand.</Description>
                    </View>
                    <DeviceConnectionToggle device={device} />
                </View>

                <View style={styles.row}>
                    <View style={styles.rowText}>
                        <Text style={styles.fieldLabel}>Pairing</Text>
                        <View style={styles.bondLine}>
                            <View style={[styles.statusDot, { backgroundColor: bondColor }]} />
                            <Description>{bondLabel}</Description>
                        </View>
                    </View>
                    {bondState !== 'BONDED' && (
                        <Button
                            onPress={repair}
                            disabled={bonding}
                            style={({ pressed }) => StyleSheet.flatten([
                                styles.saveBtn,
                                pressed && !bonding ? styles.saveBtnPressed : null,
                            ])}>
                            <Text style={styles.saveBtnTxt}>
                                {bonding ? 'Pairing…' : 'Pair'}
                            </Text>
                        </Button>
                    )}
                </View>

                <View style={styles.nameSection}>
                    <Text style={styles.fieldLabel}>Name</Text>
                    <View style={styles.nameInputRow}>
                        <TextInput
                            style={styles.input}
                            onChangeText={setDeviceName}
                            value={deviceName}
                            placeholder="Device name"
                            placeholderTextColor={SmallTextColor} />
                        <Button
                            onPress={onSaveName}
                            disabled={!nameDirty || isSaving}
                            style={({ pressed }) => StyleSheet.flatten([
                                styles.saveBtn,
                                pressed && nameDirty && !isSaving ? styles.saveBtnPressed : null,
                            ])}>
                            <Text style={styles.saveBtnTxt}>{isSaving ? 'Saving…' : 'Save'}</Text>
                        </Button>
                    </View>
                </View>
            </Card>

            <Card style={styles.card}>
                <View>
                    <Title>Automation</Title>
                    <Description>Hands-free behaviour for this vehicle.</Description>
                </View>
                <Button
                    onPress={() => nav.navigate('Proximity Settings', { mac: device.ble.id })}
                    style={({ pressed }) => StyleSheet.flatten([
                        styles.navRow,
                        pressed ? styles.navRowPressed : null,
                    ])}>
                    <View style={styles.rowText}>
                        <Text style={styles.fieldLabel}>Auto unlock / lock</Text>
                        <Description>Configure proximity-based behaviour.</Description>
                    </View>
                    <Text style={styles.navChevron}>›</Text>
                </Button>
            </Card>

            <RemoveDevice device={device} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
    },
    card: {
        gap: 16,
    },
    statusGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statusCell: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: BorderColor,
        borderRadius: 6,
        gap: 4,
    },
    statusLabel: {
        color: SmallTextColor,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusValue: {
        color: TextColor,
        fontWeight: '600',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    bondLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: BorderColor,
        paddingTop: 12,
    },
    rowText: {
        flex: 1,
    },
    fieldLabel: {
        color: TextColor,
        fontWeight: '600',
    },
    nameSection: {
        borderTopWidth: 1,
        borderTopColor: BorderColor,
        paddingTop: 12,
        gap: 8,
    },
    nameInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 6,
        borderColor: BorderColor,
        color: TextColor,
        padding: 10,
    },
    saveBtn: {
        backgroundColor: Color.Blue,
        borderColor: Color.Blue,
        paddingHorizontal: 16,
    },
    saveBtnPressed: {
        backgroundColor: Color.OffBlue,
        borderColor: Color.OffBlue,
    },
    saveBtnTxt: {
        color: Color.White,
        fontWeight: '600',
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        borderWidth: 0,
        backgroundColor: 'transparent',
        padding: 0,
    },
    navRowPressed: {
        backgroundColor: Color.OffWhite,
    },
    navChevron: {
        color: SmallTextColor,
        fontSize: 22,
    },
});
