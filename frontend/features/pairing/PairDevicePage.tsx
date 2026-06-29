import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/core/Card';
import { MainBgColor } from '@/theme/Theme';
import { Paginator } from './components/paginator';
import { Welcome, BluetoothPermission, EnableBluetooth, DeviceEnabled, ScanDevices, ConnectingTo, ConnectionComplete } from './pages';
import { useNavigation } from '@react-navigation/native';
import { usePairDeviceStore } from './stores/pairDeviceStore';

export function PairDevicePage(): React.JSX.Element {
    const navigation = useNavigation();
    const { reset } = usePairDeviceStore();
    const [currentPage, setPage] = useState(1);

    const pageUpdate = (page: number, numberOfPages: number) => {
        if (page > numberOfPages) {
            reset();

            navigation.goBack();
        }
    };

    return (
        <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
            <View style={styles.container}>
                <Card style={styles.card}>
                    <Paginator currentPage={currentPage} setPage={setPage} onPageUpdate={pageUpdate}>
                        <Welcome />
                        <BluetoothPermission />
                        <EnableBluetooth />
                        <DeviceEnabled />
                        <ScanDevices />
                        <ConnectingTo />
                        <ConnectionComplete />
                    </Paginator>
                </Card>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: MainBgColor,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    card: {
        gap: 16,
    },
});
