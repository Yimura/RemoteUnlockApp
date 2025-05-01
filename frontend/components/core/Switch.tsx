import React from 'react';
import { Switch as RNSwitch, SwitchProps } from 'react-native';
import { Color } from '../../theme/Color';

export function Switch(props: SwitchProps): React.JSX.Element {
    return (
        <RNSwitch trackColor={{
            true: Color.Blue,
            false: Color.Grey,
        }} thumbColor={Color.White} {...props} />
    );
}
