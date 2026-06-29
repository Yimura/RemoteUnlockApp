import React, { useEffect } from 'react';
import { PairContainer } from '../components/PairContainer';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '@/components/core/ProgressBar';
import { usePairDeviceStore } from '../stores/pairDeviceStore';
import { ScannedDevice } from '../components/ScannedDevice';
import { Device } from 'react-native-ble-plx';
import { usePaginator } from '../components/paginator';
import { IconButton } from '@/components/core/IconButton';
import { RefreshCcw } from 'lucide-react-native';
import { useBleDeviceScan } from '../hooks';

export function ScanDevices(): React.JSX.Element {
    const { selectedDevice, selectDevice } = usePairDeviceStore();
    const { devices, progress, scanning, rescan } = useBleDeviceScan({
        serviceUUID: '7ccf30e3-a9af-45b2-8d1d-f58e4d30ff95',
    });

    const { setNextEnabled, setNextButtonLabel } = usePaginator();
    useEffect(() => {
        setNextEnabled(false);
        setNextButtonLabel('Connect');

        return () => {
            setNextEnabled(true);
            setNextButtonLabel(null);
        };
    }, [setNextEnabled, setNextButtonLabel]);

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

                <FlatList ListEmptyComponent={!scanning ? <IconButton label={'Retry'} icon={<RefreshCcw />} onPress={rescan} /> : null} data={[...devices.values()]} keyExtractor={(item) => item.id} renderItem={({ item, index }) =>
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
