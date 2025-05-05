import React, { useEffect, useState } from 'react';
import { PairContainer } from './components/PairContainer';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '../../components/core/ProgressBar';
import { usePairDeviceStore } from '../../stores/pairDeviceStore';
import { ScannedDevice } from './components/ScannedDevice';

export function ScanDevices(): React.JSX.Element {
    const devices = [
        { deviceName: 'Volvo XC90 T8' },
        { deviceName: 'BMW X1' },
        { deviceName: 'BMW E36' },
    ];
    const [scanning, setScanning] = useState(true);
    const [progress, setProgress] = useState(0.0);
    const [selected, setSelected] = useState<number | null>(null);

    const { setNextEnabled } = usePairDeviceStore();
    useEffect(() => {
        setNextEnabled(false);

        return () => {
            setNextEnabled(true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectDevice = (idx: number) => {
        setSelected(idx);
        setNextEnabled(true);
    };

    return (
        <PairContainer>
            <PairContainer.Title text="Scanning for Devices" />
            <PairContainer.SubTitle text="Looking for Bluetooth devices nearby..." />

            <View style={styles.scannedDevicesContainer}>
                <View>
                    <Text>{scanning ? 'Scanning...' : 'Available Devices'}</Text>
                    <ProgressBar progress={0.3} />
                </View>

                <FlatList data={devices} keyExtractor={(item) => item.deviceName} renderItem={({ item, index }) =>
                    <ScannedDevice
                        key={index}
                        deviceName={item.deviceName}
                        selected={index === selected}
                        onPress={() => selectDevice(index)}
                    />
                } />
            </View>
        </PairContainer>
    );
}

const styles = StyleSheet.create({
    scannedDevicesContainer: {
        width: '100%',
        marginTop: 8,
        gap: 8,
    },
});
