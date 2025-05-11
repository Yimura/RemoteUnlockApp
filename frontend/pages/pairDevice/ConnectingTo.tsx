import React, { useEffect } from 'react';
import { PairContainer } from './components/PairContainer';
import { RadioReceiver } from 'lucide-react-native';
import { LoadingButton } from '../../components/core/LoadingButton';
import { usePairDeviceStore } from '../../stores/pairDeviceStore';

export function ConnectingTo(): React.JSX.Element {
    const { setNextEnabled } = usePairDeviceStore();

    useEffect(() => {
        setNextEnabled(false);

        return () => {
            setNextEnabled(true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <PairContainer>
            <PairContainer.Title text="Connecting to BMW E36..." />
            <PairContainer.Icon IconComponent={RadioReceiver} />
            <PairContainer.SubTitle text="Ready to pair with BMW E36." />

            <LoadingButton label="Pair Now" isLoading={false} onPress={() => { setNextEnabled(true); }} />
        </PairContainer>
    );
}
