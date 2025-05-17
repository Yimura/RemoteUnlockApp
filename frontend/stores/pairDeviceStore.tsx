import React from 'react';
import { create } from 'zustand';
import { Welcome } from '../pages/pairDevice/Welcome';
import { BluetoothPermission } from '../pages/pairDevice/BluetoothPermission';
import { EnableBluetooth } from '../pages/pairDevice/EnableBluetooth';
import { DeviceEnabled } from '../pages/pairDevice/DeviceEnabled';
import { ScanDevices } from '../pages/pairDevice/ScanDevices';
import { ConnectingTo } from '../pages/pairDevice/ConnectingTo';
import { ConnectionComplete } from '../pages/pairDevice/ConnectionComplete';
import { Device } from 'react-native-ble-plx';

interface PairDevicePageDetails {
    previousButtonLabel?: string;
    nextButtonLabel?: string;
    Node: React.ReactNode;
}

interface PairDeviceState {
    nextEnabled: boolean;
    currentPage: number;
    pages: PairDevicePageDetails[];
    lastPageCallback?: () => void;
    selectedDevice: Device | null;
}

interface PairDeviceActions {
    goToNextPage: () => void;
    gotToPreviousPage: () => void;

    setCurrentPage: (page: number) => void,
    setNextEnabled: (value: boolean) => void;
    setLastPageCallback: (callback: () => void) => void;

    selectDevice: (device: Device) => void;

    reset: () => void;
}

const defaults: PairDeviceState = {
    selectedDevice: null,
    nextEnabled: true,
    currentPage: 0,
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
        {
            nextButtonLabel: 'Finish',
            Node: <ConnectionComplete />,
        },
    ],
    lastPageCallback: undefined,
};

export const usePairDeviceStore = create<PairDeviceState & PairDeviceActions>()((set) => ({
    ...defaults,

    setNextEnabled: (value) => set(() => ({ nextEnabled: value })),

    gotToPreviousPage: () => set(({ currentPage }) => ({ currentPage: currentPage !== 0 ? currentPage - 1 : currentPage })),
    goToNextPage: () => set(({ currentPage, nextEnabled, pages, lastPageCallback }) => {
        if (!nextEnabled) {
            return {};
        }

        if (currentPage < pages.length - 1) {
            return { currentPage: currentPage + 1 };
        }

        if (lastPageCallback) {
            lastPageCallback();
        }
        return {};
    }),
    setCurrentPage: (page) => set(() => ({ currentPage: page })),

    setLastPageCallback: (callback) => set(() => ({ lastPageCallback: callback })),

    selectDevice: (device) => set(() => ({ selectedDevice: device })),

    reset: () => set(() => defaults),
}));
