import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { VehicleCard, VehicleCardProps } from '../components/VehicleCard';
import { Title } from '../components/text/Title';
import { Button } from '../components/core/Button';
import { Color } from '../theme/Color';
import { useNavigation } from '@react-navigation/native';

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
    const vehicles: VehicleCardProps['vehicle'][] = [
        // { model: 'BMW E36', battery: 14.4, connected: true, locked: true, lastConnected: new Date(Date.now() - 6e5) },
        // { model: 'Defender 90', battery: 10.3, connected: false, locked: false, lastConnected: new Date(Date.now() - 1e6) },
    ];

    return (
        <View>
            {vehicles.length > 0 && <FlatList data={vehicles} renderItem={({ item }) => <VehicleCard vehicle={item} style={styles.item} />} keyExtractor={item => item.model} />}
            {vehicles.length === 0 && <NoDevicesPaired />}
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
