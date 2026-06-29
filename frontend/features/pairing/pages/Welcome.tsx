import React, { useEffect } from 'react';
import Logo from '@/assets/brand/logo.svg';
import { PairContainer } from '../components/PairContainer';
import { usePaginator } from '../components/paginator';

export function Welcome(): React.JSX.Element {
    const { setNextEnabled } = usePaginator();

    useEffect(() => {
        setNextEnabled(true);
    }, [setNextEnabled]);

    return (
        <PairContainer>
            <Logo width={96} height={96} />
            <PairContainer.Title text="Device Bluetooth Pairing" />
            <PairContainer.SubTitle text="We'll guide you through the process of connecting your Bluetooth device to your mobile device. Make sure your device is turned on and nearby." />
        </PairContainer>
    );
}
