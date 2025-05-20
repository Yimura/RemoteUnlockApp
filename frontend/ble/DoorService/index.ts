import { Device, UUID } from 'react-native-ble-plx';
import { LockState } from '../RemoteUnlockDevice';

export const DoorServiceUUID: UUID = '7ccf30e3-a9af-45b2-8d1d-f58e4d30ff95';

export class DoorService {
    constructor(private device: Device) {

    }

    async getState(): Promise<LockState> {
        const DOOR_STATE_UUID: UUID = 'f2eb002a-7e74-4cc5-ac27-9c66f4c0c6b2';

        const characteristic = await this.device.readCharacteristicForService(DoorServiceUUID, DOOR_STATE_UUID);
        if (!characteristic.value) {
            return LockState.Unknown;
        }
        const buff = Buffer.from(characteristic.value, 'base64');
        if (buff.length !== 1) {
            // we do not accept heresy
            return LockState.Unknown;
        }

        switch (buff.at(0)) {
            case 0x0:
                return LockState.Locked;
            case 0x1:
                return LockState.Unlocked;
        }
        return LockState.Unknown;
    }

    async setState(state: LockState): Promise<void> {
        const DOOR_STATE_UUID: UUID = '78943d9a-fb5b-4580-9ec8-131d092b4b78';
        if (state === LockState.Unknown) {
            return;
        }

        const buff = [state === LockState.Unlocked ? 0x1 : 0x0];
        await this.device.writeCharacteristicWithResponseForService(DoorServiceUUID, DOOR_STATE_UUID, Buffer.from(buff).toString('base64'));
    }
}
