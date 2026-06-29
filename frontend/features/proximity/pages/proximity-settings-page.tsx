import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/Routes';
import { useProximityConfig } from '../hooks/use-proximity-config';
import { Mode } from '../services/proximity-module';
import { CalibrationModal } from '../components/calibration-modal';

type Props = NativeStackScreenProps<RootStackParamList, 'Proximity Settings'>;

const MODES: Array<{ label: string; value: Mode }> = [
    { label: 'Off',     value: 'OFF' },
    { label: 'Confirm', value: 'CONFIRM' },
    { label: 'Auto',    value: 'AUTO' },
];

export function ProximitySettingsPage({ route }: Props) {
    const { mac } = route.params;
    const { config, loading, save } = useProximityConfig(mac);
    const [calibrating, setCalibrating] = useState<'enter' | 'exit' | null>(null);

    if (loading || !config) return <ActivityIndicator />;

    return (
        <View style={{ padding: 16 }}>
            <Text>Mode</Text>
            {MODES.map((m) => (
                <Pressable
                    key={m.value}
                    onPress={() => save({ mode: m.value, enabled: m.value !== 'OFF' })}>
                    <Text>{m.label}{config.mode === m.value ? ' ✓' : ''}</Text>
                </Pressable>
            ))}

            <Text style={{ marginTop: 16 }}>Predictive unlock</Text>
            <Pressable onPress={() => save({ predictive: !config.predictive })}>
                <Text>{config.predictive ? 'On' : 'Off'}</Text>
            </Pressable>

            <Text style={{ marginTop: 16 }}>
                Enter RSSI: {config.enterRssi} dBm
            </Text>
            <Pressable onPress={() => setCalibrating('enter')}>
                <Text>Calibrate near</Text>
            </Pressable>

            <Text style={{ marginTop: 8 }}>
                Exit RSSI: {config.exitRssi} dBm
            </Text>
            <Pressable onPress={() => setCalibrating('exit')}>
                <Text>Calibrate far</Text>
            </Pressable>

            {calibrating && (
                <CalibrationModal
                    mac={mac}
                    kind={calibrating}
                    onClose={() => setCalibrating(null)}
                    onSave={(rssi) =>
                        save(calibrating === 'enter' ? { enterRssi: rssi } : { exitRssi: rssi })
                    }
                />
            )}
        </View>
    );
}
