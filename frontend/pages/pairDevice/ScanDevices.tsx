import React, { useEffect, useState } from 'react';
import { PairContainer } from './components/PairContainer';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '../../components/core/ProgressBar';
import { usePairDeviceStore } from '../../stores/pairDeviceStore';
import { ScannedDevice } from './components/ScannedDevice';
import { BLEService } from '../../services/BLEService';
import { Device } from 'react-native-ble-plx';

const SCAN_PERIOD = 3e4;
const SCAN_PROGRESS_DEFINITION = 50;

export function ScanDevices(): React.JSX.Element {
    const { selectedDevice, selectDevice } = usePairDeviceStore();

    const [scanning, setScanning] = useState(true);
    const [progress, setProgress] = useState(0.0);
    const [devices, setDevices] = useState(new Map<Device['id'], Device>());

    useEffect(() => {
        if (scanning) {
            BLEService.stopDeviceScan().then(() => {
                BLEService.startDeviceScan(['7ccf30e3-a9af-45b2-8d1d-f58e4d30ff95'], null, async (err, device) => {
                    if (err || !device) {
                        console.error(err);
                        return;
                    }

                    setDevices((prevDevices) => new Map(prevDevices.set(device.id, device)));
                });
            });

            BLEService.connectedDevices(['7ccf30e3-a9af-45b2-8d1d-f58e4d30ff95'])
                .then(connectedDevices =>
                    connectedDevices.map(device =>
                        setDevices(prevDevices => new Map(prevDevices.set(device.id, device)))
                    )
                );

            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 1.0) {
                        clearInterval(interval);
                        setScanning(false);

                        return 1.0;
                    }
                    return prev + SCAN_PROGRESS_DEFINITION / SCAN_PERIOD;
                });
            }, SCAN_PROGRESS_DEFINITION);

            return () => {
                BLEService.stopDeviceScan();
            };
        }
    }, [scanning]);

    const { setNextEnabled } = usePairDeviceStore();
    useEffect(() => {
        setNextEnabled(false);

        return () => {
            setNextEnabled(true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setSelectDevice = (device: Device) => {
        selectDevice(device);
        setNextEnabled(true);
    };

    return (
        <PairContainer>
            <PairContainer.Title text="Scanning for Devices" />
            <PairContainer.SubTitle text="Looking for Bluetooth devices nearby..." />

            <View style={styles.scannedDevicesContainer}>
                <View>
                    <Text>{scanning ? 'Scanning...' : 'Available Devices'}</Text>
                    {scanning && <ProgressBar progress={progress} />}
                </View>

                <FlatList data={[...devices.values()]} keyExtractor={(item) => item.id} renderItem={({ item, index }) =>
                    <ScannedDevice
                        key={index}
                        deviceName={item.localName || 'Unknown'}
                        selected={item.id === selectedDevice?.id}
                        onPress={() => setSelectDevice(item)}
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
