import { Button, GestureResponderEvent, StyleSheet, Text, View } from "react-native";
import ColumnGrid from "./common/ColumnGrid";
import RowGrid from "./common/RowGrid";
import { Peripheral } from "react-native-ble-manager";

export default function BluetoothDevice({ item, onPress }: { item: Peripheral, onPress?: ((event: GestureResponderEvent) => void) | undefined }) {
    return (
        <View style={styles.card}>
            <RowGrid style={{ gap: 8 }}>
                <ColumnGrid>
                    <View>
                        <Text>{item.name}</Text>
                        <Text style={styles.device_mac}>{item.id}</Text>
                    </View>
                    <View>
                        <Text>RSSI: {`${item.rssi}db`}</Text>
                    </View>
                </ColumnGrid>
                <Button title="Connect" onPress={onPress} />
            </RowGrid>
        </View >
    );
}

const styles = StyleSheet.create({
    card: {
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
