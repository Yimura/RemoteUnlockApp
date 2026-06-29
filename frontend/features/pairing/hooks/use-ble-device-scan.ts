import { useCallback, useEffect, useState } from 'react';
import type { Device } from 'react-native-ble-plx';
import { BLEService } from '@/services/BLEService';

type UseBleDeviceScanOptions = {
    serviceUUID: string;
    periodMs?: number;
    tickMs?: number;
};

type UseBleDeviceScanReturn = {
    devices: Map<Device['id'], Device>;
    progress: number;
    scanning: boolean;
    rescan: () => void;
};

export const useBleDeviceScan = ({
    serviceUUID,
    periodMs = 30_000,
    tickMs = 50,
}: UseBleDeviceScanOptions): UseBleDeviceScanReturn => {
    const [scanning, setScanning] = useState(true);
    const [progress, setProgress] = useState(0);
    const [devices, setDevices] = useState(new Map<Device['id'], Device>());

    useEffect(() => {
        if (!scanning) {
            return;
        }

        setProgress(0);
        BLEService.stopDeviceScan().then(() => {
            BLEService.startDeviceScan([serviceUUID], { legacyScan: false }, (err, device) => {
                if (err || !device) {
                    console.error(err);
                    return;
                }

                setDevices((prevDevices) => new Map(prevDevices.set(device.id, device)));
            });
        });

        BLEService.connectedDevices([serviceUUID]).then((connectedDevices) =>
            connectedDevices.forEach((device) =>
                setDevices((prevDevices) => new Map(prevDevices.set(device.id, device)))
            )
        );

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 1.0) {
                    clearInterval(interval);
                    setScanning(false);
                    return 1.0;
                }
                return prev + tickMs / periodMs;
            });
        }, tickMs);

        return () => {
            BLEService.stopDeviceScan();
            clearInterval(interval);
        };
    }, [scanning, serviceUUID, periodMs, tickMs]);

    const rescan = useCallback(() => {
        setScanning(true);
    }, []);

    return { devices, progress, scanning, rescan };
};
