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
            await this.ble.connect();
            await this.ble.discoverAllServicesAndCharacteristics();
            await this.updateStates();
        } catch (error) {
            this.connected = false;
            return false;
        }
        this.lastConnected = new Date();
        this.connected = true;
        return true;
    }

    async disconnect(): Promise<void> {
        await this.ble.cancelConnection();
        this.connected = false;
    }

    async updateStates(): Promise<void> {
        this.locked = await this.doors.getState();
        this.battery = await this.status.getVoltage();
    }
}
