import BluetoothDevice from "components/BluetoothDevice";
import { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";

export const DeviceScreen = () => {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);

        setTimeout(() => setRefreshing(false), 2e3);
    };

    return (
        <ScrollView refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            <BluetoothDevice name={'BMW E36'} identifier={'00-B0-D0-63-C2-26'} rssi={-15} />
        </ScrollView>
    );
};
