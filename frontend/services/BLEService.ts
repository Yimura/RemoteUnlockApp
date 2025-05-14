import { Linking, PermissionsAndroid, Platform } from 'react-native';
import { BleManager, LogLevel, State } from 'react-native-ble-plx';

class BLEServiceInstance extends BleManager {
    constructor() {
        super();

        this.setLogLevel(LogLevel.Debug);
    }

    async enableBluetoothForUser(): Promise<boolean> {
        if (await this.state() === State.PoweredOn) {
            return true;
        }

        try {
            await Linking.sendIntent('android.bluetooth.adapter.action.REQUEST_ENABLE');
        } catch (error) {
            return false;
        }
        return true;
    }

    async requestPermissions(): Promise<boolean> {
        if (Platform.OS !== 'android') {
            return true;
        }

        // followed the docs, no clue why this is checked lol
        if (!PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
            return false;
        }

        const apiLevel = parseInt(Platform.Version.toString(), 10);
        if (apiLevel < 31) {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }

        if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN && PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT) {
            const result = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);

            return (
                result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
            );
        }
        return false;
    }
}

export const BLEService = new BLEServiceInstance();
