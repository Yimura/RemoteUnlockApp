import React from 'react';
import { Switch as RNSwitch, SwitchProps } from 'react-native';
import { Blue, Grey, White } from '../../theme/Color';

export function Switch(props: SwitchProps): React.JSX.Element {
    return (
        <RNSwitch trackColor={{
            true: Blue,
            false: Grey,
        }} thumbColor={White} {...props} />
    );
}
