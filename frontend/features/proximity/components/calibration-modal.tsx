import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/core/Card';
import { Description, Title } from '@/components/text';
import { Color } from '@/theme/Color';
import { TextColor } from '@/theme/Theme';
import { ProximityModule } from '../services/proximity-module';

const NOISE_LIMIT = 8;
const CAPTURE_MS = 5_000;

interface Props {
    mac: string;
    kind: 'enter' | 'exit';
    onClose(): void;
    onSave(rssi: number): void | Promise<void>;
}

type Phase = 'idle' | 'capturing' | 'done' | 'noisy' | 'error';

export function CalibrationModal({ mac, kind, onClose, onSave }: Props): React.JSX.Element {
    const [phase, setPhase] = useState<Phase>('idle');
    const [result, setResult] = useState<number | null>(null);

    const start = async () => {
        setPhase('capturing');
        try {
            const r = await ProximityModule.captureRssi(mac, CAPTURE_MS);
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

    const onSavePress = () => {
        if (result !== null) {
            onSave(result);
        }
        onClose();
    };

    return (
        <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
            <Pressable style={styles.backdrop} onPress={onClose} />
            <SafeAreaView edges={['top', 'bottom']} style={styles.safe} pointerEvents="box-none">
                <Card style={styles.card}>
                    <View>
                        <Title>{kind === 'enter' ? 'Calibrate near' : 'Calibrate far'}</Title>
                        <Description>
                            {kind === 'enter'
                                ? 'Stand at the desired unlock distance from your vehicle. Hold still.'
                                : 'Walk to where the vehicle should be considered out of range. Hold still.'}
                        </Description>
                    </View>

                    {phase === 'idle' && (
                        <Button
                            onPress={start}
                            style={({ pressed }) => pressed ? styles.primaryBtnPressed : styles.primaryBtn}>
                            <Text style={styles.primaryBtnTxt}>Start capture</Text>
                        </Button>
                    )}

                    {phase === 'capturing' && (
                        <View style={styles.captureRow}>
                            <ActivityIndicator color={Color.Blue} />
                            <Description>Sampling for {CAPTURE_MS / 1000}s…</Description>
                        </View>
                    )}

                    {phase === 'noisy' && (
                        <View style={styles.statusGroup}>
                            <Text style={styles.warnTxt}>Signal too noisy. Move closer or hold still and retry.</Text>
                            <Button
                                onPress={start}
                                style={({ pressed }) => pressed ? styles.primaryBtnPressed : styles.primaryBtn}>
                                <Text style={styles.primaryBtnTxt}>Retry</Text>
                            </Button>
                        </View>
                    )}

                    {phase === 'error' && (
                        <View style={styles.statusGroup}>
                            <Text style={styles.warnTxt}>Capture failed. Check Bluetooth permissions and retry.</Text>
                            <Button
                                onPress={start}
                                style={({ pressed }) => pressed ? styles.primaryBtnPressed : styles.primaryBtn}>
                                <Text style={styles.primaryBtnTxt}>Retry</Text>
                            </Button>
                        </View>
                    )}

                    {phase === 'done' && result !== null && (
                        <View style={styles.statusGroup}>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultValue}>{result} dBm</Text>
                                <Description>Median across the capture window.</Description>
                            </View>
                            <Button
                                onPress={onSavePress}
                                style={({ pressed }) => pressed ? styles.primaryBtnPressed : styles.primaryBtn}>
                                <Text style={styles.primaryBtnTxt}>Save</Text>
                            </Button>
                        </View>
                    )}

                    <Button onPress={onClose} style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnTxt}>Cancel</Text>
                    </Button>
                </Card>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Color.OffBlack,
    },
    safe: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    card: {
        gap: 16,
    },
    captureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusGroup: {
        gap: 12,
    },
    resultRow: {
        gap: 4,
    },
    resultValue: {
        color: TextColor,
        fontSize: 28,
        fontWeight: '700',
    },
    warnTxt: {
        color: Color.Orange,
    },
    primaryBtn: {
        backgroundColor: Color.Blue,
    },
    primaryBtnPressed: {
        backgroundColor: Color.OffBlue,
    },
    primaryBtnTxt: {
        color: Color.White,
        fontWeight: '600',
    },
    cancelBtn: {
        backgroundColor: 'transparent',
    },
    cancelBtnTxt: {
        color: TextColor,
    },
});
