import { Linking } from 'react-native';
import { BleError, BleManager, Device, LogLevel, ScanOptions, State, UUID } from 'react-native-ble-plx';

class BLEServiceInstance extends BleManager {
    constructor() {
        super();

        this.setLogLevel(LogLevel.Debug);
    }

    async enableBluetoothForUser(): Promise<boolean> {
        if (await this.state() === State.PoweredOn) {
            return true;
        }

        try {
            await Linking.sendIntent('android.bluetooth.adapter.action.REQUEST_ENABLE');
        } catch (error) {
            return false;
        }
        return true;
    }

    // Peripheral uses BLE5 extended advertisements; legacyScan must be false
    // or the device is invisible to the scanner. Default it here so every
    // caller is safe without remembering the option.
    startDeviceScan(
        UUIDs: UUID[] | null,
        options: ScanOptions | null,
        listener: (error: BleError | null, scannedDevice: Device | null) => void,
    ): Promise<void> {
        return super.startDeviceScan(UUIDs, { legacyScan: false, ...(options ?? {}) }, listener);
    }
}

export const BLEService = new BLEServiceInstance();
