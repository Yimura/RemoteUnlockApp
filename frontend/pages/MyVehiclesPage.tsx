import React from 'react';
import { StyleSheet, View } from 'react-native';
import { VehicleCard } from '../components/VehicleCard';


export function MyVehiclesPage(): React.JSX.Element {
    return (
        <View style={styles.container}>
            <VehicleCard model={'BMW E36'} battery={12.4} connected={true} locked={true} lastConnected={new Date(Date.now() - 6e5)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
});
