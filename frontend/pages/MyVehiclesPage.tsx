import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { VehicleCard } from '../components/device/VehicleCard';
import { Title } from '../components/text';
import { Button } from '../components/core/Button';
import { Color } from '../theme/Color';
import { useNavigation } from '@react-navigation/native';
import { useDeviceStore } from '../stores/deviceStore';

const NoDevicesPaired = (): React.JSX.Element => {
    const navigation = useNavigation();

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
    const { devices } = useDeviceStore();

    return (
        <View>
            {devices.length > 0 && <FlatList data={devices} renderItem={({ item }) => <VehicleCard device={item} style={styles.item} />} keyExtractor={item => item.ble.id} />}
            {devices.length === 0 && <NoDevicesPaired />}
        </View>
    );
}

const styles = StyleSheet.create({
    item: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    noDevicesPaired: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '90%',
        gap: 12,
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
