import { BLEService } from '@/services/BLEService';
import { LockState, RemoteUnlockDevice } from '@/ble/RemoteUnlockDevice';
import { DoorServiceUUID } from '@/ble/DoorService';
import { ProximityModule } from '@/features/proximity';

const SCAN_TIMEOUT_MS = 5_000;

function looksLikeAuthError(err: unknown): boolean {
    const msg = String((err as { message?: string })?.message ?? err);
    return /auth|encrypt|bond|insufficient|gatt[_ ]?conn[_ ]?fail/i.test(msg);
}

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

type ProximityAction = 'unlock' | 'lock';

export async function proximityUnlockTask(data: { mac: string; action?: ProximityAction }): Promise<void> {
    const { mac } = data;
    const action: ProximityAction = data.action === 'lock' ? 'lock' : 'unlock';
    const target = action === 'lock' ? LockState.Locked : LockState.Unlocked;
    // eslint-disable-next-line no-console
    const log = (s: string) => console.warn(`[proximity:${action}] ${s}`);

    let device: RemoteUnlockDevice | null = null;
    // If the link was already up when we got here, the foreground RN app
    // (deviceStore) owns the lifecycle — tearing it down at end-of-task drops
    // its monitor subscription and breaks the next Lock/Unlock tap with a
    // "device disconnected" error until the user pull-to-refreshes. Only
    // disconnect what we ourselves opened.
    let weOpenedTheLink = false;
    try {
        log(`begin mac=${mac}`);
        const raw = await resolveBleDevice(mac);
        if (!raw) { log('device not found'); return; }

        weOpenedTheLink = !(await raw.isConnected());
        device = new RemoteUnlockDevice(raw);
        const ok = await device.connect();
        if (!ok) { log('connect failed'); return; }

        const bondBefore = await ProximityModule.getBondState(mac);
        log(`pre-write bondState=${bondBefore}`);

        try {
            await device.doors.setState(target);
            log('write ok');
        } catch (err) {
            if (!looksLikeAuthError(err)) throw err;
            log(`auth error on write (${String((err as { message?: string }).message ?? err)}), forcing rebond + retry`);
            const bonded = await ProximityModule.createBond(mac);
            log(`rebond result=${bonded}`);
            if (!bonded) throw err;
            await device.doors.setState(target);
            log('write ok after rebond');
        }
    } catch (err) {
        log(`failed: ${String((err as { message?: string }).message ?? err)}`);
    } finally {
        try {
            if (device?.connected && weOpenedTheLink) await device.disconnect();
        } catch {
            // ignore
        }
    }
}
