import React from 'react';
import { PairContainer } from './components/PairContainer';
import { Bluetooth } from 'lucide-react-native';

export function DeviceEnabled(): React.JSX.Element {
    return (
        <PairContainer>
            <PairContainer.Icon IconComponent={Bluetooth} />
            <PairContainer.Title text="Prepare for Pairing" />
            <PairContainer.SubTitle text="Make sure your device is powered on and not currently connected to any other devices." />
        </PairContainer>
    );
}
