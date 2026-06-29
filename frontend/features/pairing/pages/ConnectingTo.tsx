import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { PairContainer } from '../components/PairContainer';
import { RadioReceiver } from 'lucide-react-native';
import { Button } from '@/components/core/Button';
import { Color } from '@/theme/Color';
import { usePairDeviceStore } from '../stores/pairDeviceStore';
import { useDeviceStore } from '@/stores/deviceStore';
import { RemoteUnlockDevice } from '@/ble/RemoteUnlockDevice';
import { usePaginator } from '../components/paginator';

export function ConnectingTo(): React.JSX.Element {
    const { setNextEnabled, setNextButtonLabel } = usePaginator();
    const { selectedDevice } = usePairDeviceStore();
    const { add } = useDeviceStore();
    const [connecting, setConnecting] = useState(false);
    const [paired, setPaired] = useState(false);

    useEffect(() => {
        setNextEnabled(false);
        setNextButtonLabel('Continue');

        return () => {
            setNextEnabled(true);
            setNextButtonLabel(null);
        };
    }, [setNextEnabled, setNextButtonLabel]);

    const pairDevice = async () => {
        if (selectedDevice) {
            setConnecting(true);
            const device = new RemoteUnlockDevice(selectedDevice);
            if (await device.connect()) {
                setPaired(true);
            }
            add(device);
            setConnecting(false);
            setNextEnabled(true);
        }
    };

    return (
        <PairContainer>
            <PairContainer.Title text={`Connecting to ${selectedDevice?.localName || 'Unknown'}...`} />
            <PairContainer.Icon IconComponent={RadioReceiver} />
            <PairContainer.SubTitle text={paired && 'Successfully paired!' || `Ready to pair with ${selectedDevice?.localName || 'Unknown'}.`} />

            {!paired && (
                <Button
                    onPress={pairDevice}
                    disabled={connecting}
                    style={({ pressed }) => StyleSheet.flatten([
                        styles.primary,
                        pressed && !connecting ? styles.primaryPressed : null,
                    ])}>
                    {connecting
                        ? <ActivityIndicator size={19} color={Color.White} />
                        : <Text style={styles.primaryTxt}>Pair Now</Text>}
                </Button>
            )}
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
