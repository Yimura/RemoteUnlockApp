import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { ProximityModule } from '../services/proximity-module';

const NOISE_LIMIT = 8;

interface Props {
    mac: string;
    kind: 'enter' | 'exit';
    onClose(): void;
    onSave(rssi: number): void | Promise<void>;
}

export function CalibrationModal({ mac, kind, onClose, onSave }: Props) {
    const [phase, setPhase] = useState<'idle' | 'capturing' | 'done' | 'noisy' | 'error'>('idle');
    const [result, setResult] = useState<number | null>(null);

    const start = async () => {
        setPhase('capturing');
        try {
            const r = await ProximityModule.captureRssi(mac, 5000);
            if (r.stddev > NOISE_LIMIT) {
                setPhase('noisy');
                return;
            }
            setResult(r.rssi);
            setPhase('done');
        } catch {
            setPhase('error');
        }
    };

    return (
        <Modal transparent visible onRequestClose={onClose}>
            <View style={{ padding: 24 }}>
                <Text>
                    {kind === 'enter'
                        ? 'Stand at desired unlock distance. Hold still.'
                        : 'Walk to where the vehicle should be considered out of range.'}
                </Text>
                {phase === 'idle' && <Pressable onPress={start}><Text>Start</Text></Pressable>}
                {phase === 'capturing' && <ActivityIndicator />}
                {phase === 'noisy' && (
                    <View>
                        <Text>Signal too noisy. Retry standing still.</Text>
                        <Pressable onPress={start}><Text>Retry</Text></Pressable>
                    </View>
                )}
                {phase === 'error' && (
                    <View>
                        <Text>Capture failed.</Text>
                        <Pressable onPress={start}><Text>Retry</Text></Pressable>
                    </View>
                )}
                {phase === 'done' && result !== null && (
                    <View>
                        <Text>{result} dBm</Text>
                        <Pressable onPress={() => { onSave(result); onClose(); }}>
                            <Text>Save</Text>
                        </Pressable>
                    </View>
                )}
                <Pressable onPress={onClose}><Text>Cancel</Text></Pressable>
            </View>
        </Modal>
    );
}
