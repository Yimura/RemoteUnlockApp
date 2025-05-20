import { Device, UUID } from 'react-native-ble-plx';

export const StatusServiceUUID = '30cf7994-4afb-45f1-b041-6eae54895794';

export class StatusService {
    constructor(private device: Device) {

    }

    async getVoltage(): Promise<number | undefined> {
        const GET_VOLTAGE_UUID: UUID = '2a6c7a4f-22bb-45da-8eed-3839e6826adf';

        const characteristic = await this.device.readCharacteristicForService(StatusServiceUUID, GET_VOLTAGE_UUID);
        if (!characteristic.value) {
            return undefined;
        }

        const buff = Buffer.from(characteristic.value, 'base64');
        if (buff.length !== 4) {
            return undefined;
        }
        return buff.readFloatLE();
    }
}
