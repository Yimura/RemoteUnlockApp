import { Platform, PermissionsAndroid } from "react-native";

export async function handleAndroidPermissions() {
    if (Platform.OS !== "android") {
        console.debug("Platform is not Android.");

        return;
    }

    const version: number = Platform.Version;
    if (version >= 31) {
        const status = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        console.debug("Got SDK>=31 permissions: ", status);
    }
    else if (version >= 23) {
        const checkResult = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (!checkResult) {
            const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            console.debug("Got SDK>=23 permissions: ", status);
        }
    }
}
