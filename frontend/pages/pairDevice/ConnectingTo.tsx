import React from 'react';
import { PairContainer } from './components/PairContainer';
import { RadioReceiver } from 'lucide-react-native';

export function ConnectingTo(): React.JSX.Element {
    return (
        <PairContainer>
            <PairContainer.Title text="Connecting to BMW E36..." />
            <PairContainer.Icon IconComponent={RadioReceiver} />
            <PairContainer.SubTitle text="Ready to pair with BMW E36." />
        </PairContainer>
    );
}
