import { Device } from 'react-native-ble-plx';
import { SettingService } from './SettingsService';
import { DoorService } from './DoorService';
import { StatusService } from './StatusService';

export enum LockState {
    Unknown = 'Unknown',
    Locked = 'Locked',
    Unlocked = 'Unlocked',
}

export class RemoteUnlockDevice {
    ble: Device;
    battery?: number;
    connected: boolean = false;
    locked: LockState = LockState.Unknown;
    lastConnected?: Date;

    doors: DoorService;
    status: StatusService;
    settings: SettingService;

    constructor(device: Device) {
        this.ble = device;

        this.doors = new DoorService(device);
        this.status = new StatusService(device);
        this.settings = new SettingService(device);
    }

    async connect(): Promise<boolean> {
        try {
            if (!(await this.ble.isConnected())) {
                await this.ble.connect();
            }
            await this.ble.discoverAllServicesAndCharacteristics();
            this.connected = true;
            this.lastConnected = new Date();
            await this.readStates();
        } catch (error) {
            this.connected = false;
            return false;
        }
        return true;
    }

    async disconnect(): Promise<void> {
        await this.ble.cancelConnection();
        this.connected = false;
    }

    // Reconcile local connection flag with the actual ble-plx state, then
    // read characteristics. A device returned by BleManager.connectedDevices()
    // is OS-connected but may not yet be bound to this BleManager instance —
    // per react-native-ble-plx docs we still need to call .connect() on it
    // before reading characteristics.
    async updateStates(): Promise<void> {
        try {
            if (!(await this.ble.isConnected())) {
                await this.ble.connect();
            }
            await this.ble.discoverAllServicesAndCharacteristics();
            this.connected = true;
            this.lastConnected = this.lastConnected ?? new Date();
            await this.readStates();
        } catch {
            this.connected = false;
        }
    }

    private async readStates(): Promise<void> {
        this.locked = await this.doors.getState();
        this.battery = await this.status.getVoltage();
    }
}
