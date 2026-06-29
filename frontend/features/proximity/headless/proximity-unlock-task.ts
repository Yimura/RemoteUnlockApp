import { BLEService } from '@/services/BLEService';
import { LockState, RemoteUnlockDevice } from '@/ble/RemoteUnlockDevice';
import { DoorServiceUUID } from '@/ble/DoorService';

const SCAN_TIMEOUT_MS = 5_000;

async function resolveBleDevice(mac: string) {
    const connected = await BLEService.connectedDevices([DoorServiceUUID]);
    const fromConnected = connected.find((d) => d.id === mac);
    if (fromConnected) return fromConnected;

    const known = await BLEService.devices([mac]);
    const fromKnown = known.find((d) => d.id === mac);
    if (fromKnown) return fromKnown;

    // Cold-wake fallback: scan briefly for the MAC, then return the first hit.
    return await new Promise<import('react-native-ble-plx').Device | null>((resolve) => {
        let resolved = false;
        const settle = (d: import('react-native-ble-plx').Device | null) => {
            if (resolved) return;
            resolved = true;
            BLEService.stopDeviceScan().catch(() => {});
            resolve(d);
        };
        const timer = setTimeout(() => settle(null), SCAN_TIMEOUT_MS);
        BLEService.startDeviceScan([DoorServiceUUID], { legacyScan: false }, (err, device) => {
            if (err) { clearTimeout(timer); settle(null); return; }
            if (device && device.id === mac) {
                clearTimeout(timer);
                settle(device);
            }
        });
    });
}

export async function proximityUnlockTask(data: { mac: string }): Promise<void> {
    const { mac } = data;
    let device: RemoteUnlockDevice | null = null;
    try {
        const raw = await resolveBleDevice(mac);
        if (!raw) {
            // eslint-disable-next-line no-console
            console.warn('[proximity] device not found for unlock', mac);
            return;
        }
        device = new RemoteUnlockDevice(raw);
        const ok = await device.connect();
        if (!ok) return;
        await device.doors.setState(LockState.Unlocked);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[proximity] unlock task failed', err);
    } finally {
        try {
            if (device?.connected) await device.disconnect();
        } catch {
            // ignore
        }
    }
}
