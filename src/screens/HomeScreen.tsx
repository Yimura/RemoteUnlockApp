import { KnownBluetoothDevice } from "components/KnownBluetoothDevice";
import { SERVICE_UUIDS } from "constants/BluetoothConstants";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import BleManager, { Peripheral } from "react-native-ble-manager";

export const HomeScreen = () => {
    const [peripherals, setPeripherals] = useState(new Map<Peripheral['id'], Peripheral>());

    useEffect(() => {
        BleManager.getConnectedPeripherals(SERVICE_UUIDS).then(peripherals => peripherals.map(peripheral => setPeripherals(map => map.set(peripheral.id, peripheral))));
    });

    return (
        <FlatList
            data={Array.from(peripherals.values())}
            renderItem={KnownBluetoothDevice}
            contentContainerStyle={styles.container}
            style={{
                padding: 16,
            }}
        />
    );
};


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        rowGap: 16
    }
});
