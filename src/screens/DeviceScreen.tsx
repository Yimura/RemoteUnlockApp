import { NavigationProp } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TextInput, View } from "react-native";
import { Peripheral } from "react-native-ble-manager";

export default function DeviceScreen({ navigation, route }: { navigation: NavigationProp<any>, route: any }) {
    const peripheral: Peripheral = route.params.item;
    const [connected, setConnected] = useState(false);
    const [pinCode, setPinCode] = useState('');

    useEffect(() => {
        navigation.setOptions({ title: peripheral.name });
    }, [peripheral]);

    useEffect(() => {
        if (pinCode.length == 6) {
            setConnected(true);
        }
    }, [pinCode]);

    const ConnectedView = () => {

    };

    const PasswordView = ({ value, onUpdateText }: { value: string, onUpdateText: React.Dispatch<React.SetStateAction<string>> }) => {
        const [currentValue, setCurrentValue] = useState(value);

        return (<View style={styles.centeredView}>
            <TextInput
                style={[styles.passwordInput]}
                placeholder="Device Pin"
                keyboardType="numeric"
                textAlign="center"
                maxLength={6}
                secureTextEntry={true}
                value={currentValue}
                onChangeText={setCurrentValue}
                onEndEditing={() => onUpdateText(currentValue)}
            />
        </View>
        );
    };

    return (
        <View style={styles.container}>
            {!connected && <PasswordView value={pinCode} onUpdateText={setPinCode} />}
            {connected && <ActivityIndicator size="large" />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    passwordInput: {
        width: 128,
        height: 32,
        padding: 8,

        borderBottomColor: 'black',
        borderBottomWidth: StyleSheet.hairlineWidth
    }
});
