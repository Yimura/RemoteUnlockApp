import React, { useEffect } from 'react';
import { PairContainer } from '../components/PairContainer';
import { Bluetooth } from 'lucide-react-native';
import { usePaginator } from '../components/paginator';

export function DeviceEnabled(): React.JSX.Element {
    const { setNextButtonLabel } = usePaginator();

    useEffect(() => {
        setNextButtonLabel('Scan for devices');

        return () => {
            setNextButtonLabel(null);
        };
    }, [setNextButtonLabel]);

    return (
        <PairContainer>
            <PairContainer.Icon IconComponent={Bluetooth} />
            <PairContainer.Title text="Prepare for Pairing" />
            <PairContainer.SubTitle text="Make sure your device is powered on and not currently connected to any other devices." />
        </PairContainer>
    );
}
