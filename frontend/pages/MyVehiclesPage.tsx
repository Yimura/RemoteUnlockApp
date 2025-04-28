import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { VehicleCard, VehicleCardProps } from '../components/VehicleCard';


export function MyVehiclesPage(): React.JSX.Element {
    const vehicles: VehicleCardProps['vehicle'][] = [
        { model: 'BMW E36', battery: 14.4, connected: true, locked: true, lastConnected: new Date(Date.now() - 6e5) },
        { model: 'Tesla Model 3', battery: 11.6, connected: true, locked: false, lastConnected: new Date(Date.now() - 3e5) },
        { model: 'Defender 90', battery: 10.3, connected: false, locked: true, lastConnected: new Date(Date.now() - 1e6) },
    ];

    return (
        <View style={styles.container}>
            <FlatList data={vehicles} renderItem={({ item }) => <VehicleCard vehicle={item} style={styles.item} />} keyExtractor={item => item.model} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    item: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
});
