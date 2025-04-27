import React from 'react';
import { StyleSheet, View } from 'react-native';
import { VehicleCard } from '../components/VehicleCard';


export function MyVehiclesPage(): React.JSX.Element {
    return (
        <View style={styles.container}>
            <VehicleCard />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
});
