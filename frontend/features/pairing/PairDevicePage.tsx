import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/core/Card';
import { Paginator } from './components/paginator';
import { Welcome, BluetoothPermission, EnableBluetooth, DeviceEnabled, ScanDevices, ConnectingTo, ConnectionComplete } from './pages';

export function PairDevicePage(): React.JSX.Element {
    const [currentPage, setPage] = useState(1);

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Paginator currentPage={currentPage} setPage={setPage}>
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '90%',
    },
});
