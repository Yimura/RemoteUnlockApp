import React, { useContext, useEffect, useState } from 'react';
import { PairContainer } from '../components/PairContainer';
import { Bluetooth, Power } from 'lucide-react-native';
import { IconButton } from '@/components/core/IconButton';
import { BLEService } from '@/services/BLEService';
import { LoadingView } from '@/components/core/LoadingView';
import { State } from 'react-native-ble-plx';
import { useOnForegroundFocus } from '@/hooks/OnFocus';
import { PaginatorContext } from '../components/paginator';

export function EnableBluetooth(): React.JSX.Element {
    const { isNextEnabled, setNextEnabled, setNextButtonLabel } = useContext(PaginatorContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setNextButtonLabel('Continue');

        BLEService.state().then(state => {
            const bluetoothEnabled = state === State.PoweredOn;
            setLoading(false);
            setNextEnabled(bluetoothEnabled);
        });

        return () => {
            setNextEnabled(true);
            setNextButtonLabel(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useOnForegroundFocus(() => {
        BLEService.state().then(state => {
            setNextEnabled(state === State.PoweredOn);
        });
    });

    const enableBluetoothForUser = async () => {
        const result = await BLEService.enableBluetoothForUser();

        setNextEnabled(result);
    };

    return (
        <PairContainer>
            <PairContainer.Icon IconComponent={Power} />
            <PairContainer.Title text="Turn on bluetooth" />
            <PairContainer.SubTitle text={isNextEnabled ? 'Bluetooth is ready to be used, you can proceed to the next step.' : 'Let\'s make sure bluetooth is enabled on your device.'} />
            {!isNextEnabled && <LoadingView loading={loading}>
                <IconButton label="Enable Bluetooth" icon={<Bluetooth size={16} />} onPress={enableBluetoothForUser} />
            </LoadingView>}
        </PairContainer>
    );
}
