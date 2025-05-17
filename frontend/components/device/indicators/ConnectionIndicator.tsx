import { Circle } from 'lucide-react-native';
import { Color } from '../../../theme/Color';
import { Indicator } from './Indicator';
import React from 'react';

interface ConnectionIndicatorProps {
    connected: boolean;
}
export const ConnectionIndicator = ({ connected }: ConnectionIndicatorProps): React.JSX.Element => {
    const color = connected ? Color.Green : Color.Red;
    const icon = <Circle color={color} size={10} />;

    return <Indicator color={color} icon={icon} label={connected ? 'Connected' : 'Disconnected'} />;
};
