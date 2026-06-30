import { Device, Subscription, UUID } from 'react-native-ble-plx';

export const StatusServiceUUID = '30cf7994-4afb-45f1-b041-6eae54895794';
const VOLTAGE_UUID: UUID = '2a6c7a4f-22bb-45da-8eed-3839e6826adf';

function decodeVoltage(base64Value: string | null): number | undefined {
    if (!base64Value) return undefined;
    const buff = Buffer.from(base64Value, 'base64');
    if (buff.length !== 4) return undefined;
    return buff.readFloatLE();
}

export class StatusService {
    constructor(private device: Device) {

    }

    async getVoltage(): Promise<number | undefined> {
        const characteristic = await this.device.readCharacteristicForService(StatusServiceUUID, VOLTAGE_UUID);
        return decodeVoltage(characteristic.value);
    }

    // Voltage is marked INDICATE on the peripheral (StatusService.hpp:20).
    // Subscribing keeps battery readings live without polling — the
    // peripheral updates its m_Voltage atomic from the scheduler task and
    // Indicate fires whenever the value changes.
    watchVoltage(onChange: (voltage: number) => void): Subscription {
        return this.device.monitorCharacteristicForService(
            StatusServiceUUID,
            VOLTAGE_UUID,
            (error, characteristic) => {
                if (error || !characteristic?.value) return;
                const v = decodeVoltage(characteristic.value);
                if (v !== undefined) onChange(v);
            },
        );
    }
}
