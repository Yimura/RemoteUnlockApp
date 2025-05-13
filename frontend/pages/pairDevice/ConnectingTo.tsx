import React, { useEffect } from 'react';
import { PairContainer } from './components/PairContainer';
import { RadioReceiver } from 'lucide-react-native';
import { LoadingButton } from '../../components/core/LoadingButton';
import { usePairDeviceStore } from '../../stores/pairDeviceStore';
import { useDeviceStore } from '../../stores/deviceStore';

export function ConnectingTo(): React.JSX.Element {
    const { setNextEnabled } = usePairDeviceStore();
    const { add } = useDeviceStore();

    useEffect(() => {
        setNextEnabled(false);

        return () => {
            setNextEnabled(true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pairDevice = () => {
        add({
            mac: 'BE:AC:B2:6E:F1:1E',
            model: 'BMW E36',
            battery: 14.5,
            connected: true,
            locked: true,
            lastConnected: new Date(),
        });

        setNextEnabled(true);
    };

    return (
        <PairContainer>
            <PairContainer.Title text="Connecting to BMW E36..." />
            <PairContainer.Icon IconComponent={RadioReceiver} />
            <PairContainer.SubTitle text="Ready to pair with BMW E36." />

            <LoadingButton label="Pair Now" isLoading={false} onPress={pairDevice} />
        </PairContainer>
    );
}
