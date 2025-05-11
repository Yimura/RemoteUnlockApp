import React from 'react';
import { PairContainer } from './components/PairContainer';
import { Check } from 'lucide-react-native';
import { Color } from '../../theme/Color';


export function ConnectionComplete(): React.JSX.Element {
    return (
        <PairContainer>
            <PairContainer.Icon IconComponent={Check} color={Color.Green} backgroundColor={Color.FadedGreen} />
            <PairContainer.Title text="Setup Complete" />
            <PairContainer.SubTitle text="Your device is now connected." />
        </PairContainer>
    );
}
