import { BatteryCharging, BatteryFull, BatteryLow, BatteryMedium } from 'lucide-react-native';
import { Color } from '../../../theme/Color';
import React from 'react';
import { Indicator } from './Indicator';

interface BatterIndicatorProps {
    battery?: number;
}
export const BatteryIndicator = ({ battery }: BatterIndicatorProps): React.JSX.Element => {
    let color = Color.Green;
    let icon = <BatteryCharging color={color} size={16} />;

    if (battery) {
        if (battery < 10.8) {
            color = Color.Red;
            icon = <BatteryLow color={color} size={16} />;
        }
        else if (battery < 11.5) {
            color = Color.Orange;
            icon = <BatteryMedium color={color} size={16} />;
        }
        else if (battery < 13) {
            color = Color.Green;
            icon = <BatteryFull color={color} size={16} />;
        }
    }

    return <Indicator color={color} icon={icon} label={`${battery && (Math.round(battery * 10) / 10) || '?.?'}V`} />;
};
