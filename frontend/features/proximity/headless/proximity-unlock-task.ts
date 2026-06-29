import { BLEService } from '@/services/BLEService';
import { LockState, RemoteUnlockDevice } from '@/ble/RemoteUnlockDevice';
import { DoorServiceUUID } from '@/ble/DoorService';

export async function proximityUnlockTask(data: { mac: string }): Promise<void> {
    const { mac } = data;
    let device: RemoteUnlockDevice | null = null;
    try {
        const connected = await BLEService.connectedDevices([DoorServiceUUID]);
        let raw = connected.find((d) => d.id === mac);
        if (!raw) {
            const known = await BLEService.devices([mac]);
            raw = known.find((d) => d.id === mac);
        }
        if (!raw) {
            return;
        }
        device = new RemoteUnlockDevice(raw);
        const ok = await device.connect();
        if (!ok) return;
        await device.doors.setState(LockState.Unlocked);
    } catch (err) {
        // log via console; native side handles retry-disable policy
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
