import React, { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BellOff } from 'lucide-react-native';
import { RootStackParamList } from '@/Routes';
import { Card } from '@/components/core/Card';
import { Button } from '@/components/core/Button';
import { Description, Title } from '@/components/text';
import { SettingItem } from '@/components/settings/SettingItem';
import { Color } from '@/theme/Color';
import { BorderColor, TextColor } from '@/theme/Theme';
import { hasNotificationPermission, requestNotificationPermission } from '@/util/Notifications';
import { useProximityConfig } from '../hooks/use-proximity-config';
import { Mode } from '../services/proximity-module';
import { CalibrationModal } from '../components/calibration-modal';

type Props = NativeStackScreenProps<RootStackParamList, 'Proximity Settings'>;

const MODES: Array<{ label: string; value: Mode; description: string }> = [
    { label: 'Off', value: 'OFF', description: 'Disable auto unlock for this vehicle.' },
    { label: 'Confirm', value: 'CONFIRM', description: 'Send a tap-to-unlock notification when you approach.' },
    { label: 'Auto', value: 'AUTO', description: 'Unlock automatically the moment you are in range.' },
];

export function ProximitySettingsPage({ route }: Props): React.JSX.Element {
    const { mac } = route.params;
    const { config, loading, save } = useProximityConfig(mac);
    const [calibrating, setCalibrating] = useState<'enter' | 'exit' | null>(null);
    const [notifBlocked, setNotifBlocked] = useState(false);

    if (loading || !config) {
        return (
            <View style={styles.container}>
                <Card><Description>Loading…</Description></Card>
            </View>
        );
    }

    const onPickMode = async (next: Mode) => {
        if (next !== 'OFF') {
            const already = await hasNotificationPermission();
            if (!already) {
                const granted = await requestNotificationPermission();
                setNotifBlocked(!granted);
            } else {
                setNotifBlocked(false);
            }
        } else {
            setNotifBlocked(false);
        }
        save({ mode: next, enabled: next !== 'OFF' });
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <View>
                    <Title>Mode</Title>
                    <Description>How this device unlocks when you approach.</Description>
                </View>
                <View style={styles.modeList}>
                    {MODES.map((m) => {
                        const selected = config.mode === m.value;
                        return (
                            <Button
                                key={m.value}
                                onPress={() => onPickMode(m.value)}
                                style={({ pressed }) => StyleSheet.flatten([
                                    styles.modeRow,
                                    selected ? styles.modeRowSelected : null,
                                    pressed ? styles.modeRowPressed : null,
                                ])}>
                                <View style={styles.modeRowText}>
                                    <Text style={[styles.modeRowLabel, selected ? styles.modeRowLabelSelected : null]}>
                                        {m.label}
                                    </Text>
                                    <Description>{m.description}</Description>
                                </View>
                                {selected && <Text style={styles.modeRowCheck}>✓</Text>}
                            </Button>
                        );
                    })}
                </View>
                {notifBlocked && config.mode !== 'OFF' && (
                    <View style={styles.notifWarn}>
                        <BellOff size={18} color={Color.Orange} />
                        <View style={styles.notifWarnText}>
                            <Text style={styles.notifWarnTitle}>Notifications disabled</Text>
                            <Description>
                                Without notifications you won't see the persistent service banner or
                                tap-to-unlock prompts. The proximity service still runs.
                            </Description>
                        </View>
                        <Button
                            onPress={() => Linking.openSettings()}
                            style={({ pressed }) => StyleSheet.flatten([
                                styles.notifWarnBtn,
                                pressed ? styles.notifWarnBtnPressed : null,
                            ])}>
                            <Text style={styles.notifWarnBtnTxt}>Settings</Text>
                        </Button>
                    </View>
                )}
            </Card>

            <Card style={styles.card}>
                <View>
                    <Title>Predictive unlock</Title>
                    <Description>
                        Fire the unlock slightly early when signal trend predicts an imminent threshold cross.
                    </Description>
                </View>
                <SettingItem
                    label="Predictive lookahead"
                    description="Adds roughly 500 ms of head-start before the door opens."
                    value={config.predictive}
                    onChange={() => save({ predictive: !config.predictive })} />
            </Card>

            <Card style={styles.card}>
                <View>
                    <Title>Calibration</Title>
                    <Description>
                        Tune the near and far thresholds by capturing a signal sample at the distance you want.
                    </Description>
                </View>
                <View style={styles.thresholdRow}>
                    <View style={styles.thresholdText}>
                        <Text style={styles.thresholdLabel}>Enter RSSI</Text>
                        <Description>{config.enterRssi} dBm</Description>
                    </View>
                    <Button
                        onPress={() => setCalibrating('enter')}
                        style={({ pressed }) => pressed ? styles.actionBtnPressed : styles.actionBtn}>
                        <Text style={styles.actionBtnTxt}>Calibrate near</Text>
                    </Button>
                </View>
                <View style={styles.thresholdRow}>
                    <View style={styles.thresholdText}>
                        <Text style={styles.thresholdLabel}>Exit RSSI</Text>
                        <Description>{config.exitRssi} dBm</Description>
                    </View>
                    <Button
                        onPress={() => setCalibrating('exit')}
                        style={({ pressed }) => pressed ? styles.actionBtnPressed : styles.actionBtn}>
                        <Text style={styles.actionBtnTxt}>Calibrate far</Text>
                    </Button>
                </View>
            </Card>

            {calibrating && (
                <CalibrationModal
                    mac={mac}
                    kind={calibrating}
                    onClose={() => setCalibrating(null)}
                    onSave={(rssi) =>
                        save(calibrating === 'enter' ? { enterRssi: rssi } : { exitRssi: rssi })
                    } />
            )}
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
    modeList: {
        gap: 8,
    },
    modeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        gap: 8,
    },
    modeRowSelected: {
        borderColor: Color.Blue,
        backgroundColor: Color.WashedBlue,
    },
    modeRowPressed: {
        backgroundColor: Color.OffWhite,
    },
    modeRowText: {
        flex: 1,
    },
    modeRowLabel: {
        color: TextColor,
        fontWeight: '600',
    },
    modeRowLabelSelected: {
        color: Color.Blue,
    },
    modeRowCheck: {
        color: Color.Blue,
        fontSize: 18,
        fontWeight: '700',
    },
    thresholdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: BorderColor,
        paddingTop: 12,
    },
    thresholdText: {
        flex: 1,
    },
    thresholdLabel: {
        color: TextColor,
        fontWeight: '600',
    },
    actionBtn: {
        backgroundColor: Color.Blue,
        paddingHorizontal: 14,
    },
    actionBtnPressed: {
        backgroundColor: Color.OffBlue,
        paddingHorizontal: 14,
    },
    actionBtnTxt: {
        color: Color.White,
        fontWeight: '600',
    },
    notifWarn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(217, 119, 6, 0.08)',
        borderWidth: 1,
        borderColor: Color.Orange,
        borderRadius: 8,
        padding: 10,
    },
    notifWarnText: {
        flex: 1,
    },
    notifWarnTitle: {
        color: TextColor,
        fontWeight: '600',
    },
    notifWarnBtn: {
        backgroundColor: Color.Orange,
        borderColor: Color.Orange,
        paddingHorizontal: 12,
    },
    notifWarnBtnPressed: {
        backgroundColor: 'rgb(184, 100, 6)',
        borderColor: 'rgb(184, 100, 6)',
    },
    notifWarnBtnTxt: {
        color: Color.White,
        fontWeight: '600',
    },
});
