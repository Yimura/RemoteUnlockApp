import { Button, StyleSheet, Text, View, ViewProps } from "react-native";
import ColumnGrid from "./ColumnGrid";
import RowGrid from "./RowGrid";

const styles = StyleSheet.create({
    card: {
        margin: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,

        backgroundColor: '#0002',
        borderRadius: 8
    },
    device_mac: {
        fontSize: 11,
        color: '#3c3c3c'
    }
});

interface BluetoothDeviceInformation {
    name: String;
    identifier: String;
    rssi: Number;
};

export default function BluetoothDevice({ name, identifier, rssi }: BluetoothDeviceInformation) {
    const onPress = () => {
        console.info("Device was pressed");
    };

    return <View style={styles.card}>
        <RowGrid style={{ gap: 8 }}>
            <ColumnGrid>
                <View>
                    <Text>{name}</Text>
                    <Text style={styles.device_mac}>{identifier}</Text>
                </View>
                <View>
                    <Text>RSSI: {`${rssi}db`}</Text>
                </View>
            </ColumnGrid>
            <Button title="Connect" onPress={onPress} />
        </RowGrid>
    </View >;
}
