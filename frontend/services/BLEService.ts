import { Linking } from 'react-native';
import { BleManager, LogLevel, State } from 'react-native-ble-plx';

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
}

export const BLEService = new BLEServiceInstance();
