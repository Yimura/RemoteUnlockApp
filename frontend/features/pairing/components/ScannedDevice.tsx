import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/core/Card';
import { PairContainer } from './PairContainer';
import { Check, RadioReceiver } from 'lucide-react-native';
import { Color } from '../../../theme/Color';

interface ScanneDeviceProps {
    deviceName: string;
    selected: boolean;
    onPress: () => void;
}
export function ScannedDevice({ deviceName, selected, onPress }: ScanneDeviceProps): React.JSX.Element {
    return (
        <Pressable style={[styles.scannedDevicePressable]} onPress={onPress}>
            <Card style={[styles.scannedDeviceCard, selected ? styles.scannedDeviceCardSelected : undefined]}>
                <View style={styles.deviceDetails}>
                    <PairContainer.Icon IconComponent={RadioReceiver} size={20} />
                    <Text>{deviceName}</Text>
                </View>
                {selected && <Check color={Color.Blue} />}
            </Card>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    scannedDevicePressable: {
        width: '100%',
    },
    scannedDeviceCard: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    scannedDeviceCardSelected: {
        backgroundColor: Color.WashedBlue,
        borderColor: Color.Blue,
    },
    deviceDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
});
