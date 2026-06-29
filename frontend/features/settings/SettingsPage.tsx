import React, { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bluetooth, BluetoothOff, ChevronRight, Info, ShieldCheck, Sliders, Zap } from 'lucide-react-native';
import { State } from 'react-native-ble-plx';
import { Card } from '@/components/core/Card';
import { Button } from '@/components/core/Button';
import { Dropdown } from '@/components/core/Dropdown';
import { SettingItem } from '@/components/settings/SettingItem';
import { Description, Title } from '@/components/text';
import { BLEService } from '@/services/BLEService';
import { Color } from '@/theme/Color';
import { BorderColor, MainBgColor, SmallTextColor, TextColor } from '@/theme/Theme';
import { ProximityModule } from '@/features/proximity';
import { useProximityStore } from '@/features/proximity/stores/proximity-store';
import { useDeviceStore } from '@/stores/deviceStore';

const APP_VERSION = '0.0.1';
const STALE_MS = 5 * 60_000;

const SCAN_INTERVAL_OPTIONS = [
    { label: '1 second (high battery use)', value: 1 },
    { label: '2 seconds', value: 2 },
    { label: '3 seconds', value: 3 },
    { label: '5 seconds (recommended)', value: 5 },
    { label: '10 seconds', value: 10 },
    { label: '30 seconds (lowest battery use)', value: 30 },
];

export function SettingsPage(): React.JSX.Element {
    const [btState, setBtState] = useState<State>(State.Unknown);
    const [heartbeat, setHeartbeat] = useState<number>(0);

    // Preferences (UI stubs — not yet wired to a persistent store).
    const [runInBackground, setRunInBackground] = useState(true);
    const [notifications, setNotifications] = useState(false);
    const [scanInterval, setScanInterval] = useState(5);

    const configs = useProximityStore((s) => s.configs);
    const devices = useDeviceStore((s) => s.devices);

    useEffect(() => {
        let cancelled = false;
        BLEService.state().then((s) => !cancelled && setBtState(s));
        const sub = BLEService.onStateChange((s) => setBtState(s), false);
        return () => { cancelled = true; sub.remove(); };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const read = async () => {
            const hb = await ProximityModule.heartbeatAt();
            if (!cancelled) setHeartbeat(hb);
        };
        read();
        const id = setInterval(read, 60_000);
        return () => { cancelled = true; clearInterval(id); };
    }, []);

    const btOn = btState === State.PoweredOn;
    const enabledCount = devices.filter((d) => configs[d.ble.id]?.enabled).length;
    const serviceStale = enabledCount > 0 && heartbeat > 0 && Date.now() - heartbeat > STALE_MS;

    const openBluetoothSettings = () => {
        Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS').catch(() => {});
    };
    const openBatteryExemption = () => {
        Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS').catch(() => {});
    };

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
            <Card style={styles.card}>
                <View>
                    <Title>Bluetooth</Title>
                    <Description>State of the Bluetooth adapter this app talks through.</Description>
                </View>

                <View style={styles.statusRow}>
                    <View style={styles.statusIconWrap}>
                        {btOn
                            ? <Bluetooth size={20} color={Color.Blue} />
                            : <BluetoothOff size={20} color={Color.Grey} />}
                    </View>
                    <View style={styles.rowText}>
                        <Text style={styles.rowLabel}>{btOn ? 'Enabled' : 'Disabled'}</Text>
                        <Description>{btStateDescription(btState)}</Description>
                    </View>
                    <View style={[
                        styles.statePill,
                        {
                            backgroundColor: btOn ? Color.WashedBlue : Color.BrokenWhite,
                            borderColor: btOn ? Color.Blue : Color.Grey,
                        },
                    ]}>
                        <Text style={[
                            styles.statePillTxt,
                            { color: btOn ? Color.Blue : Color.Grey },
                        ]}>
                            {btOn ? 'ON' : 'OFF'}
                        </Text>
                    </View>
                </View>

                {!btOn && (
                    <Button
                        onPress={() => BLEService.enableBluetoothForUser()}
                        style={({ pressed }) => StyleSheet.flatten([
                            styles.primary,
                            pressed ? styles.primaryPressed : null,
                        ])}>
                        <Bluetooth size={16} color={Color.White} />
                        <Text style={styles.primaryTxt}>Enable Bluetooth</Text>
                    </Button>
                )}

                <Pressable
                    onPress={openBluetoothSettings}
                    style={({ pressed }) => StyleSheet.flatten([
                        styles.linkRow,
                        pressed ? styles.linkRowPressed : null,
                    ])}>
                    <Text style={styles.linkTxt}>Open Bluetooth settings</Text>
                    <ChevronRight size={18} color={SmallTextColor} />
                </Pressable>
            </Card>

            <Card style={styles.card}>
                <View style={styles.statusRow}>
                    <View style={styles.statusIconWrap}>
                        <Sliders size={20} color={Color.Blue} />
                    </View>
                    <View style={styles.rowText}>
                        <Title>Preferences</Title>
                        <Description>Global app behaviour that applies to every paired device.</Description>
                    </View>
                </View>

                <SettingItem
                    label="Run in background"
                    description="Allow the app to keep its proximity service alive when minimised."
                    value={runInBackground}
                    onChange={() => setRunInBackground((v) => !v)} />

                <SettingItem
                    label="Notifications"
                    description="Get notified when a vehicle locks or unlocks."
                    value={notifications}
                    onChange={() => setNotifications((v) => !v)} />

                <View style={styles.divider} />

                <Dropdown
                    label="Bluetooth scan interval"
                    helperText="How often to look for nearby devices when auto-lock is enabled."
                    options={SCAN_INTERVAL_OPTIONS}
                    onValueChange={(v) => typeof v === 'number' && setScanInterval(v)}
                    selectedValue={scanInterval} />

                <Button
                    onPress={() => {/* TODO: persist preferences */}}
                    style={({ pressed }) => StyleSheet.flatten([
                        styles.primary,
                        pressed ? styles.primaryPressed : null,
                    ])}>
                    <Text style={styles.primaryTxt}>Save changes</Text>
                </Button>
            </Card>

            <Card style={styles.card}>
                <View>
                    <Title>Auto unlock / lock</Title>
                    <Description>
                        Background proximity service across all paired vehicles. Configure per-device
                        behaviour from each vehicle's settings.
                    </Description>
                </View>

                <View style={styles.statusRow}>
                    <View style={styles.statusIconWrap}>
                        <Zap size={20} color={enabledCount > 0 ? Color.Blue : Color.Grey} />
                    </View>
                    <View style={styles.rowText}>
                        <Text style={styles.rowLabel}>
                            {enabledCount > 0
                                ? `Active on ${enabledCount} ${enabledCount === 1 ? 'device' : 'devices'}`
                                : 'Not in use'}
                        </Text>
                        <Description>
                            {enabledCount > 0
                                ? (serviceStale
                                    ? 'Service may have been paused by the system.'
                                    : 'Service running in the background.')
                                : 'Enable on a vehicle from its Device Settings.'}
                        </Description>
                    </View>
                </View>

                {enabledCount > 0 && (
                    <Pressable
                        onPress={openBatteryExemption}
                        style={({ pressed }) => StyleSheet.flatten([
                            styles.linkRow,
                            pressed ? styles.linkRowPressed : null,
                        ])}>
                        <ShieldCheck size={16} color={SmallTextColor} />
                        <Text style={styles.linkTxt}>Battery optimisation exemption</Text>
                        <ChevronRight size={18} color={SmallTextColor} />
                    </Pressable>
                )}
            </Card>

            <Card style={styles.card}>
                <View>
                    <Title>About</Title>
                    <Description>Build information for this installation.</Description>
                </View>

                <View style={styles.statusRow}>
                    <View style={styles.statusIconWrap}>
                        <Info size={20} color={Color.Blue} />
                    </View>
                    <View style={styles.rowText}>
                        <Text style={styles.rowLabel}>Remote Unlock</Text>
                        <Description>
                            v{APP_VERSION} · {Platform.OS === 'android' ? `Android API ${Platform.Version}` : Platform.OS}
                        </Description>
                    </View>
                </View>
            </Card>
        </ScrollView>
    );
}

function btStateDescription(s: State): string {
    switch (s) {
        case State.PoweredOn:    return 'Ready for BLE communication.';
        case State.PoweredOff:   return 'Turn on Bluetooth to use this app.';
        case State.Unauthorized: return 'App lacks Bluetooth permissions.';
        case State.Resetting:    return 'Adapter is resetting…';
        case State.Unsupported:  return 'This device does not support BLE.';
        default:                 return 'Checking adapter state…';
    }
}

const styles = StyleSheet.create({
    scroll: {
        backgroundColor: MainBgColor,
    },
    container: {
        padding: 16,
        gap: 16,
        paddingBottom: 32,
    },
    card: {
        gap: 16,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Color.FadedBlue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowText: {
        flex: 1,
    },
    rowLabel: {
        color: TextColor,
        fontWeight: '600',
    },
    statePill: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    statePillTxt: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    primary: {
        backgroundColor: Color.Blue,
        borderColor: Color.Blue,
    },
    primaryPressed: {
        backgroundColor: Color.OffBlue,
        borderColor: Color.OffBlue,
    },
    primaryTxt: {
        color: Color.White,
        fontWeight: '600',
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: BorderColor,
        paddingTop: 12,
    },
    linkRowPressed: {
        backgroundColor: Color.OffWhite,
    },
    linkTxt: {
        flex: 1,
        color: TextColor,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: BorderColor,
    },
});
