import React, { useEffect } from 'react';
import { PairContainer } from './components/PairContainer';
import { Bluetooth, Power } from 'lucide-react-native';
import { IconButton } from '../../components/core/IconButton';
import { usePairDeviceStore } from '../../stores/pairDeviceStore';
import { BLEService } from '../../services/BLEService';

export function EnableBluetooth(): React.JSX.Element {
    const { setNextEnabled } = usePairDeviceStore();

    useEffect(() => {
        setNextEnabled(false);

        return () => {
            setNextEnabled(true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const enableBluetoothForUser = async () => {
        const result = await BLEService.enableBluetoothForUser();

        setNextEnabled(result);
    };

    return (
        <PairContainer>
            <PairContainer.Icon IconComponent={Power} />
            <PairContainer.Title text="Turn on bluetooth" />
            <PairContainer.SubTitle text="Let's make sure bluetooth is enabled on your device." />
            <IconButton label="Enable Bluetooth" icon={<Bluetooth size={16} />} onPress={enableBluetoothForUser} />
        </PairContainer>
    );
}
