import React, { useEffect, useState } from 'react';
import { PairContainer } from './components/PairContainer';
import { RadioReceiver } from 'lucide-react-native';
import { LoadingButton } from '../../components/core/LoadingButton';
import { usePairDeviceStore } from '../../stores/pairDeviceStore';
import { useDeviceStore } from '../../stores/deviceStore';
import { RemoteUnlockDevice } from '../../ble/RemoteUnlockDevice';

export function ConnectingTo(): React.JSX.Element {
    const { setNextEnabled, selectedDevice } = usePairDeviceStore();
    const { add } = useDeviceStore();
    const [connecting, setConnecting] = useState(false);
    const [paired, setPaired] = useState(false);

    useEffect(() => {
        setNextEnabled(false);

        return () => {
            setNextEnabled(true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

            {!paired && <LoadingButton label="Pair Now" isLoading={connecting} onPress={pairDevice} />}
        </PairContainer>
    );
}
