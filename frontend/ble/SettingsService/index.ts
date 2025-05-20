import { Device, UUID } from 'react-native-ble-plx';

export const SettingServiceUUID = '3b54f484-0c81-4442-849f-0197895f2e53';

export class SettingService {
    constructor(private device: Device) {

    }

    async setName(newName: String): Promise<boolean> {
        const SET_NAME_UUID: UUID = '0ab8e741-ede3-4a49-9d80-55f96354bc7a';
        if (newName.length > 20) {
            return false;
        }

        await this.device.writeCharacteristicWithResponseForService(SettingServiceUUID, SET_NAME_UUID, Buffer.from(newName).toString('base64'));
        return true;
    }
}
