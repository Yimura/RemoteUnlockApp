import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import RowGrid from "./common/RowGrid";
import ColumnGrid from "./common/ColumnGrid";
import { Peripheral } from "react-native-ble-manager";
import IconButton from "./common/IconButton";

export function KnownBluetoothDevice({ item }: { item: Peripheral }) {
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
                <ColumnGrid style={styles.buttonGrid}>
                    <Pressable style={[styles.button, styles.leftButton]}>
                        <IconButton name="lock-closed-outline" />
                    </Pressable>
                    <Pressable style={[styles.button, styles.rightButton]}>
                        <IconButton name="lock-open-outline" />
                    </Pressable>
                </ColumnGrid>
            </RowGrid>
        </View>
    );
}

const buttonBorderRadius = 8;
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
    },
    buttonGrid: {
        justifyContent: 'center'
    },
    button: {
        backgroundColor: '#f1f1f1',
        padding: 8
    },
    leftButton: {
        borderTopLeftRadius: buttonBorderRadius,
        borderBottomLeftRadius: buttonBorderRadius,
        borderRightWidth: StyleSheet.hairlineWidth
    },
    rightButton: {
        borderTopRightRadius: buttonBorderRadius,
        borderBottomRightRadius: buttonBorderRadius
    }
});
