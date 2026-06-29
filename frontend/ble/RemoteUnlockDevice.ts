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
    // read characteristics if connected. Lets refresh() observe already-OS-
    // connected devices without spawning a new connect attempt.
    async updateStates(): Promise<void> {
        try {
            const live = await this.ble.isConnected();
            if (!live) {
                this.connected = false;
                return;
            }
            // Services may not be discovered yet for OS-handover connections.
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
