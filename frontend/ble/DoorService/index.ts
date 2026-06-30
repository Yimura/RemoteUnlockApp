import { Device, Subscription, UUID } from 'react-native-ble-plx';
import { LockState } from '../RemoteUnlockDevice';

export const DoorServiceUUID: UUID = '7ccf30e3-a9af-45b2-8d1d-f58e4d30ff95';
const DOOR_STATE_UUID: UUID = 'f2eb002a-7e74-4cc5-ac27-9c66f4c0c6b2';
const DOOR_TOGGLE_UUID: UUID = '78943d9a-fb5b-4580-9ec8-131d092b4b78';

function decodeLockState(base64Value: string | null): LockState {
    if (!base64Value) return LockState.Unknown;
    const buff = Buffer.from(base64Value, 'base64');
    if (buff.length !== 1) return LockState.Unknown;
    switch (buff.at(0)) {
        case 0x0: return LockState.Locked;
        case 0x1: return LockState.Unlocked;
    }
    return LockState.Unknown;
}

export class DoorService {
    constructor(private device: Device) {

    }

    async getState(): Promise<LockState> {
        const characteristic = await this.device.readCharacteristicForService(DoorServiceUUID, DOOR_STATE_UUID);
        return decodeLockState(characteristic.value);
    }

    // The peripheral indicates DoorLockState on every write to the toggle
    // characteristic (DoorService.cpp:33 — m_DoorLockStateCharacteristic
    // .Indicate(conn_handle)). Subscribing here lets the UI react to local
    // toggles, ProximityService unlocks, and even out-of-band changes from a
    // different central without polling. The returned Subscription must be
    // remove()'d when the wrapper tears down or the subscription leaks across
    // reconnects.
    watchState(onChange: (state: LockState) => void): Subscription {
        return this.device.monitorCharacteristicForService(
            DoorServiceUUID,
            DOOR_STATE_UUID,
            (error, characteristic) => {
                // ble-plx surfaces the disconnect as an error on the monitor;
                // there's nothing to act on — the RemoteUnlockDevice wrapper
                // will re-subscribe on the next connect.
                if (error || !characteristic?.value) return;
                onChange(decodeLockState(characteristic.value));
            },
        );
    }

    async setState(state: LockState): Promise<void> {
        if (state === LockState.Unknown) {
            return;
        }

        const buff = [state === LockState.Unlocked ? 0x1 : 0x0];
        await this.device.writeCharacteristicWithResponseForService(DoorServiceUUID, DOOR_TOGGLE_UUID, Buffer.from(buff).toString('base64'));
    }
}
