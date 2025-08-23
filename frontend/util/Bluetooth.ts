import { PermissionsAndroid, Platform } from 'react-native';

export async function hasBluetoothPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
        return true;
    }

    if (await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) &&
        await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN) &&
        await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT)) {
        return true;
    }

    return false;
}

export async function requestBluetoothPermissions(): Promise<boolean> {
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
