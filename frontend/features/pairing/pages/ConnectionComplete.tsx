import React, { useEffect } from 'react';
import { PairContainer } from '../components/PairContainer';
import { Check } from 'lucide-react-native';
import { Color } from '@/theme/Color';
import { usePaginator } from '../components/paginator';


export function ConnectionComplete(): React.JSX.Element {
    const { setNextButtonLabel } = usePaginator();

    useEffect(() => {
        setNextButtonLabel('Finish');

        return () => {
            setNextButtonLabel(null);
        };
    }, [setNextButtonLabel]);

    return (
        <PairContainer>
            <PairContainer.Icon IconComponent={Check} color={Color.Green} backgroundColor={Color.FadedGreen} />
            <PairContainer.Title text="Setup Complete" />
            <PairContainer.SubTitle text="Your device is now connected." />
        </PairContainer>
    );
}
