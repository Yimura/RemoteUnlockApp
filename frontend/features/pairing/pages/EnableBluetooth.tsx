import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { PairContainer } from '../components/PairContainer';
import { Bluetooth, Power } from 'lucide-react-native';
import { IconButton } from '@/components/core/IconButton';
import { BLEService } from '@/services/BLEService';
import { Color } from '@/theme/Color';
import { State } from 'react-native-ble-plx';
import { useOnForegroundFocus } from '@/hooks';
import { usePaginator } from '../components/paginator';
import { ForcedLoader } from '../components/ForcedLoader';

const isBluetoothEnabled = async () => {
    const state = await BLEService.state();
    return state === State.PoweredOn;
};

export function EnableBluetooth(): React.JSX.Element {
    const { currentPage, setPage, isNextEnabled, setNextEnabled, setNextButtonLabel } = usePaginator();

    useEffect(() => {
        setNextButtonLabel('Continue');

        return () => {
            setNextEnabled(true);
            setNextButtonLabel(null);
        };
    }, [setNextButtonLabel, setNextEnabled]);

    const goToNextPage = (evaluated: boolean) => {
        if (evaluated) {
            setPage(currentPage + 1);
        }
    };

    useOnForegroundFocus(() => {
        BLEService.state().then(state => {
            const bluetoothEnabled = state === State.PoweredOn;

            setNextEnabled(bluetoothEnabled);
            goToNextPage(bluetoothEnabled);
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
            <ForcedLoader stateCheck={isBluetoothEnabled} timeoutCallback={goToNextPage}>
                <IconButton
                    label="Enable Bluetooth"
                    icon={<Bluetooth size={16} color={Color.White} />}
                    style={({ pressed }: { pressed: boolean }) => StyleSheet.flatten([
                        styles.primary,
                        pressed ? styles.primaryPressed : null,
                    ])}
                    textStyle={styles.primaryTxt}
                    onPress={enableBluetoothForUser} />
            </ForcedLoader>
        </PairContainer>
    );
}

const styles = StyleSheet.create({
    primary: {
        backgroundColor: Color.Blue,
        borderColor: Color.Blue,
        paddingHorizontal: 16,
    },
    primaryPressed: {
        backgroundColor: Color.OffBlue,
        borderColor: Color.OffBlue,
    },
    primaryTxt: {
        color: Color.White,
        fontWeight: '600',
    },
});
