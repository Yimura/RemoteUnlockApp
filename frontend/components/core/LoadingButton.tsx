import React from 'react';
import { Button, ButtonProps } from './Button';
import { ActivityIndicator, Text } from 'react-native';
import { Color } from '../../theme/Color';

interface LoadingButtonProps extends Omit<ButtonProps, 'children'> {
    label: string;
    isLoading: boolean;
}

export function LoadingButton(props: LoadingButtonProps): React.JSX.Element {
    const { label, isLoading } = props;

    return (
        <Button {...props}>
            {isLoading && <ActivityIndicator size={19} color={Color.Blue} />}
            {!isLoading && <Text>{label}</Text>}
        </Button>
    );
}
