import Icon from "@react-native-vector-icons/ionicons";
import { NavigationProp } from "@react-navigation/native";
import { CHARACTERISTIC_UUIDS, SERVICE_UUIDS } from "constants/BluetoothConstants";
import { DeviceScreenState } from "constants/DeviceScreenConstants";
import { AuthenticateMessage } from "models/AuthenticateMessage";
import CommandMessage, { Command } from "models/CommandMessage";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, NativeEventEmitter, NativeModules, Pressable, StyleSheet, TextInput, View } from "react-native";
import BleManager, { Peripheral } from "react-native-ble-manager";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default function DeviceScreen({ navigation, route }: { navigation: NavigationProp<any>, route: any }) {
    const peripheral: Peripheral = route.params.item;
    const [state, setState] = useState(DeviceScreenState.Disconnected);
    const [pinCode, setPinCode] = useState('');

    useEffect(() => {
        navigation.setOptions({ title: peripheral.name });
    }, [peripheral]);

    useEffect(() => {
        if (pinCode.length == 6) {
            setState(DeviceScreenState.Connecting);

            BleManager.connect(peripheral.id, {
                autoconnect: true
            }).then(_ => {
                console.debug("Connected to device.");

                BleManager.retrieveServices(peripheral.id, SERVICE_UUIDS).then(_ =>
                    BleManager.requestMTU(peripheral.id, 128).then(_ => {
                        const authMsg = new AuthenticateMessage(pinCode);

                        BleManager.write(peripheral.id, SERVICE_UUIDS[0], CHARACTERISTIC_UUIDS[0], authMsg.serialize(), 128);

                        setState(DeviceScreenState.Connected);
                    })
                );

                const onDeviceDisconnect = (event: { peripheral: string }) => {
                    if (event.peripheral == peripheral.id) {
                        goBack();
                    }
                };

                bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', onDeviceDisconnect);
            }).catch(error => {
                console.warn(error);
            });
        }
    }, [pinCode]);

    const goBack = () => {
        bleManagerEmitter.removeAllListeners('BleManagerDisconnectPeripheral');

        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const ConnectedView = () => {
        const unlockDevice = () => {
            const cmd = new CommandMessage(Command.OPEN);

            BleManager.write(peripheral.id, SERVICE_UUIDS[0], CHARACTERISTIC_UUIDS[0], cmd.serialize(), 128).then(_ => {
                console.info("Sent open command.");
            });
        };

        const lockDevice = () => {
            const cmd = new CommandMessage(Command.CLOSE);

            BleManager.write(peripheral.id, SERVICE_UUIDS[0], CHARACTERISTIC_UUIDS[0], cmd.serialize(), 128).then(_ => {
                console.info("Sent close command.");
            });
        };

        return (
            <View style={[{ gap: 24 }, styles.centeredView]}>
                <Pressable style={styles.iconButton} onPress={unlockDevice}>
                    <Icon name="lock-open-outline" size={48} />
                </Pressable>
                <Pressable style={styles.iconButton} onPress={lockDevice}>
                    <Icon name="lock-closed-outline" size={48} />
                </Pressable>
            </View>
        );
    };

    const PasswordView = ({ value, onUpdateText }: { value: string, onUpdateText: React.Dispatch<React.SetStateAction<string>> }) => {
        const [currentValue, setCurrentValue] = useState(value);

        return (
            <View style={styles.centeredView}>
                <TextInput
                    style={styles.passwordInput}
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

    const StateMachineView = () => {
        switch (state) {
            case DeviceScreenState.Disconnected:
                return <PasswordView value={pinCode} onUpdateText={setPinCode} />;
            case DeviceScreenState.Connecting:
                return <ActivityIndicator style={styles.centeredView} size="large" />;
            case DeviceScreenState.Connected:
                return <ConnectedView />
        }
    };

    const disconnect = () => {
        if (state == DeviceScreenState.Connected) {
            BleManager.disconnect(peripheral.id, true).then(_ => {
                console.debug("Disconnected from device, going back to previous screen.");

                goBack();
            }).catch(_ => {
                console.log("Failed to disconnect from device, going back to previous screen.");

                goBack();
            });
        }
        else {
            console.debug("Not connected to device, going back to previous state.");

            goBack();
        }
    };

    return (
        <View style={styles.container}>
            <StateMachineView />
            {state != DeviceScreenState.Connecting && <Button title="Disconnect" onPress={disconnect} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    connectedContainer: {

    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconButton: {
        padding: 16,
        borderWidth: 2,
        borderRadius: 12
    },
    passwordInput: {
        width: 128,
        height: 32,
        padding: 8,

        borderBottomColor: 'black',
        borderBottomWidth: StyleSheet.hairlineWidth
    }
});
