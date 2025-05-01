import React, { useEffect } from 'react';
import { Bluetooth } from 'lucide-react-native';
import { PairContainer } from './components/PairContainer';
import { usePairDeviceStore } from '../../stores/pairDeviceStore';

export function Welcome(): React.JSX.Element {
    const { setNextEnabled } = usePairDeviceStore();

    useEffect(() => {
        setNextEnabled(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <PairContainer>
            <PairContainer.Icon IconComponent={Bluetooth} />
            <PairContainer.Title text="Device Bluetooth Pairing" />
            <PairContainer.SubTitle text="We'll guide you through the process of connecting your Bluetooth device to your mobile device. Make sure your device is turned on and nearby." />
        </PairContainer>
    );
}
