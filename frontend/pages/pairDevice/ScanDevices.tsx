import React, { useEffect, useState } from 'react';
import { PairContainer } from './components/PairContainer';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '../../components/core/ProgressBar';
import { usePairDeviceStore } from '../../stores/pairDeviceStore';
import { ScannedDevice } from './components/ScannedDevice';
import { BLEService } from '../../services/BLEService';
import { Device, ScanCallbackType, ScanMode } from 'react-native-ble-plx';

export function ScanDevices(): React.JSX.Element {
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

    const [devices, setDevices] = useState(new Map<Device['id'], Device>());
    useEffect(() => {
        BLEService.stopDeviceScan().then(() => {
            BLEService.startDeviceScan(['7ccf30e3-a9af-45b2-8d1d-f58e4d30ff95', '3b54f484-0c81-4442-849f-0197895f2e53'], { callbackType: ScanCallbackType.AllMatches, scanMode: ScanMode.LowLatency }, (err, device) => {
                if (err || !device) {
                    console.error(err);
                    return;
                }

                setDevices((prevDevices) => new Map(prevDevices.set(device.id, device)));
            });
        });

        return () => {
            BLEService.stopDeviceScan();
        };
    }, []);

    return (
        <PairContainer>
            <PairContainer.Title text="Scanning for Devices" />
            <PairContainer.SubTitle text="Looking for Bluetooth devices nearby..." />

            <View style={styles.scannedDevicesContainer}>
                <View>
                    <Text>{scanning ? 'Scanning...' : 'Available Devices'}</Text>
                    <ProgressBar progress={0.3} />
                </View>

                <FlatList data={[...devices.values()]} keyExtractor={(item) => item.id} renderItem={({ item, index }) =>
                    <ScannedDevice
                        key={index}
                        deviceName={item.name || 'Unknown'}
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
