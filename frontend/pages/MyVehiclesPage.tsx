import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { DeviceCard } from '../components/device/DeviceCard';
import { Title } from '../components/text';
import { Button } from '../components/core/Button';
import { Color } from '../theme/Color';
import { useDeviceStore } from '../stores/deviceStore';
import { useRootNavigation } from '../hooks/Navigation';
import { MainBgColor } from '../theme/Theme';

const NoDevicesPaired = (): React.JSX.Element => {
    const navigation = useRootNavigation();

    return (
        <View style={styles.noDevicesPaired}>
            <Title>No devices paired</Title>
            <Text>Pair a new device to control your vehicle.</Text>
            <Button style={({ pressed }) => pressed ? styles.pairDeviceBtnPressed : styles.pairDeviceBtn} onPress={() => navigation.navigate('Bluetooth Device Pairing')}>
                <Text style={styles.pairDeviceBtnTxt}>Pair New Device</Text>
            </Button>
        </View>
    );
};

export function MyVehiclesPage(): React.JSX.Element {
    const { devices, refresh, isRefreshing } = useDeviceStore();

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                ListEmptyComponent={<NoDevicesPaired />}
                refreshing={isRefreshing}
                onRefresh={refresh}
                data={devices}
                renderItem={({ item }) => <DeviceCard device={item} style={styles.item} />}
                keyExtractor={item => item.ble.id} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: MainBgColor,
        height: '100%',
    },
    item: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    noDevicesPaired: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '90%',
        gap: 12,
        marginVertical: 12,
    },
    pairDeviceBtn: {
        backgroundColor: Color.Blue,
    },
    pairDeviceBtnTxt: {
        color: Color.White,
    },
    pairDeviceBtnPressed: {
        backgroundColor: Color.OffBlue,
    },
});
