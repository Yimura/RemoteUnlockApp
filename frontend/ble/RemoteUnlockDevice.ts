import { Device, Subscription } from 'react-native-ble-plx';
import { ProximityModule } from '@/features/proximity';
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

    // Set by deviceStore so a peripheral-initiated lock state change can
    // re-spread the devices array and re-render any subscribed component.
    // Plain mutation of `this.locked` is invisible to Zustand selectors.
    private onStateChange?: (device: RemoteUnlockDevice) => void;
    private lockStateSub?: Subscription;

    constructor(device: Device) {
        this.ble = device;

        this.doors = new DoorService(device);
        this.status = new StatusService(device);
        this.settings = new SettingService(device);
    }

    setOnStateChange(cb: (device: RemoteUnlockDevice) => void): void {
        this.onStateChange = cb;
    }

    async connect(): Promise<boolean> {
        try {
            if (!(await this.ble.isConnected())) {
                await this.ble.connect();
            }
            await this.ble.discoverAllServicesAndCharacteristics();
            this.connected = true;
            this.lastConnected = new Date();
            await this.ensureBonded();
            await this.readStates();
        } catch (error) {
            this.connected = false;
            return false;
        }
        return true;
    }

    // Some characteristics on the peripheral require an OS-level bond before
    // writes succeed. Without this the first write triggers an implicit
    // pairing prompt mid-operation. Force-bond up front so the user sees the
    // dialog at a predictable moment and subsequent writes go through clean.
    async ensureBonded(): Promise<void> {
        try {
            const state = await ProximityModule.getBondState(this.ble.id);
            if (state === 'BONDED') return;
            await ProximityModule.createBond(this.ble.id);
        } catch {
            // best-effort; underlying write will surface a more useful error
        }
    }

    async disconnect(): Promise<void> {
        this.stopWatching();
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

    // Arm a monitor on the DoorLockState indication. Caller must invoke
    // setOnStateChange() first or peripheral-initiated changes silently drop.
    // Safe to call repeatedly — prior subscription is torn down before the
    // new one arms. ble-plx removes subscriptions on disconnect, so a
    // reconnect must call this again. The deviceStore drives both ends:
    // add() wires the callback + starts watching, refresh() re-arms after
    // updateStates() restores the connection.
    startWatching(): void {
        this.lockStateSub?.remove();
        this.lockStateSub = this.doors.watchState((state) => {
            if (this.locked === state) return;
            this.locked = state;
            this.onStateChange?.(this);
        });
    }

    stopWatching(): void {
        this.lockStateSub?.remove();
        this.lockStateSub = undefined;
    }
}
