import { PermissionsAndroid, Platform } from 'react-native';

const REQUIRES_RUNTIME_REQUEST = 33; // Android 13 (TIRAMISU) introduced POST_NOTIFICATIONS

function shouldCheck(): boolean {
    if (Platform.OS !== 'android') return false;
    const api = parseInt(Platform.Version.toString(), 10);
    return api >= REQUIRES_RUNTIME_REQUEST;
}

export async function hasNotificationPermission(): Promise<boolean> {
    if (!shouldCheck()) return true;
    return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
}

export async function requestNotificationPermission(): Promise<boolean> {
    if (!shouldCheck()) return true;
    const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
}
