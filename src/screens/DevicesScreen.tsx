import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { NavigationProp } from "@react-navigation/native";
import BluetoothDevice from "components/BluetoothDevice";
import { ALLOW_DUPLICATES, SECONDS_TO_SCAN_FOR, SERVICE_UUIDS } from "constants/BluetoothConstants";
import { useEffect, useState } from "react";
import { EmitterSubscription, FlatList, NativeEventEmitter, NativeModules, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { BleScanCallbackType, BleScanMatchMode, BleScanMode, Peripheral } from "react-native-ble-manager";
import BleManager from "react-native-ble-manager";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { handleAndroidPermissions } from "util/BluetoothUtils";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const nullFunc = () => { };

export const DevicesScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [scanning, setScanning] = useState(false);

    const [peripherals, setPeripherals] = useState(
        new Map<Peripheral['id'], Peripheral>(),
    );

    const handleDiscoverPeripheral = (peripheral: Peripheral) => {
        peripheral.name ??= "Unknown";

        setPeripherals(map => new Map(map.set(peripheral.id, peripheral)));
    };

    const handleStopScan = () => {
        setScanning(false);
        setRefreshing(false);
    };

    const startScan = () => {
        if (scanning) {
            console.debug("A scan is already in progress.");
            return;
        }

        setRefreshing(true);
        setScanning(true);
        BleManager.scan(SERVICE_UUIDS, SECONDS_TO_SCAN_FOR, ALLOW_DUPLICATES, {
            matchMode: BleScanMatchMode.Sticky,
            scanMode: BleScanMode.LowLatency,
            callbackType: BleScanCallbackType.AllMatches
        });
    };

    useEffect(() => {
        BleManager.start();

        const listeners: EmitterSubscription[] = [
            bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral),
            bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan),
            bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', nullFunc),
            bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', nullFunc),
            bleManagerEmitter.addListener('BleManagerConnectPeripheral', nullFunc),
        ];

        handleAndroidPermissions().then(startScan);

        // do cleanup
        return () => {
            console.debug("Fragment is being destroyed, unmounting.");

            for (const listener of listeners) {
                listener.remove();
            }
        };
    }, []);

    const onRefresh = startScan;

    const renderItem = ({ item }: { item: Peripheral }) => {
        return <BluetoothDevice item={item} onPress={() => navigation.navigate('deviceScreen', { item })} />
    };

    return (
        <FlatList
            data={Array.from(peripherals.values())}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            refreshControl={< RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
})
