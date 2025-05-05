import React from 'react';
import { create } from 'zustand';
import { Welcome } from '../pages/pairDevice/Welcome';
import { BluetoothPermission } from '../pages/pairDevice/BluetoothPermission';
import { EnableBluetooth } from '../pages/pairDevice/EnableBluetooth';
import { DeviceEnabled } from '../pages/pairDevice/DeviceEnabled';
import { ScanDevices } from '../pages/pairDevice/ScanDevices';
import { ConnectingTo } from '../pages/pairDevice/ConnectingTo';

interface PairDevicePageDetails {
    previousButtonLabel?: string;
    nextButtonLabel?: string;
    Node: React.ReactNode;
}

interface PairDeviceState {
    nextEnabled: boolean;
    pages: PairDevicePageDetails[];
}

interface PairDeviceActions {
    setNextEnabled: (value: boolean) => void;
}

export const usePairDeviceStore = create<PairDeviceState & PairDeviceActions>()((set) => ({
    nextEnabled: true,
    setNextEnabled: (value) => set(() => ({ nextEnabled: value })),

    pages: [
        {
            Node: <Welcome />,
        },
        {
            nextButtonLabel: 'Continue',
            Node: <BluetoothPermission />,
        },
        {
            nextButtonLabel: 'Continue',
            Node: <EnableBluetooth />,
        },
        {
            nextButtonLabel: 'Scan for devices',
            Node: <DeviceEnabled />,
        },
        {
            nextButtonLabel: 'Connect',
            Node: <ScanDevices />,
        },
        {
            nextButtonLabel: 'Continue',
            Node: <ConnectingTo />,
        },
    ],
}));
