import { Clock4 } from 'lucide-react-native';
import React from 'react';
import { Indicator } from './Indicator';
import { GetTimeAgo } from '../../../util/Time';
import { Color } from '../../../theme/Color';

interface LastSeenIndicatorProps {
    date?: Date;
}
export const LastSeenIndicator = ({ date }: LastSeenIndicatorProps): React.JSX.Element => {
    const color = Color.Grey;
    const icon = <Clock4 color={color} size={16} />;

    return <Indicator color={color} icon={icon} label={date && GetTimeAgo(date) || 'unknown'} />;
};
