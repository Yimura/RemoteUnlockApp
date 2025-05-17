import { Circle } from 'lucide-react-native';
import { Indicator } from './Indicator';
import React from 'react';
import { Color } from '../../../theme/Color';
import { LockState } from '../../../stores/deviceStore';

interface LockIndicatorProps {
    locked: LockState;
}

export const LockIndicator = ({ locked }: LockIndicatorProps): React.JSX.Element => {
    const color = locked ? Color.Blue : Color.Orange;
    const icon = <Circle color={color} size={10} />;

    return <Indicator color={color} icon={icon} label={locked} />;
};
