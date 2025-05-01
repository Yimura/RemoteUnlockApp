import React, { useState } from 'react';
import { ColorValue, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { IconButton } from './core/IconButton';
import { BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, Circle, Clock4, Lock, Settings, Unlock } from 'lucide-react-native';
import { GetTimeAgo } from '../util/Time';
import { Color } from '../theme/Color';
import { Card } from './core/Card';
import { useNavigation } from '@react-navigation/native';
import { Title } from './text/Title';
import { Description } from './text/Description';
import { LoadingButton } from './core/LoadingButton';

interface IndicatorProps {
    color: ColorValue,
    icon: React.JSX.Element;
    label: string;
}
function Indicator({ color, icon, label }: IndicatorProps): React.JSX.Element {
    return (
        <View style={styles.indicator}>
            {icon}
            <Text style={{ color }}>{label}</Text>
        </View>
    );
}

interface ConnectionIndicatorProps {
    connected: boolean;
}
const ConnectionIndicator = ({ connected }: ConnectionIndicatorProps): React.JSX.Element => {
    const color = connected ? Color.Green : Color.Red;
    const icon = <Circle color={color} size={10} />;

    return <Indicator color={color} icon={icon} label={connected ? 'Connected' : 'Disconnected'} />;
};

interface LockIndicatorProps {
    locked: boolean;
}
const LockIndicator = ({ locked }: LockIndicatorProps): React.JSX.Element => {
    const color = locked ? Color.Blue : Color.Orange;
    const icon = <Circle color={color} size={10} />;

    return <Indicator color={color} icon={icon} label={locked ? 'Locked' : 'Unlocked'} />;
};

interface BatterIndicatorProps {
    battery: number;
}
const BatterIndicator = ({ battery }: BatterIndicatorProps): React.JSX.Element => {
    let color = Color.Green;
    let icon = <BatteryCharging color={color} size={16} />;

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

    return <Indicator color={color} icon={icon} label={`${Math.round(battery * 10) / 10}V`} />;
};

interface LastSeenIndicatorProps {
    date: Date;
}
const LastSeenIndicator = ({ date }: LastSeenIndicatorProps): React.JSX.Element => {
    const color = Color.Grey;
    const icon = <Clock4 color={color} size={16} />;

    return <Indicator color={color} icon={icon} label={GetTimeAgo(date)} />;
};

export interface VehicleCardProps {
    vehicle: {
        model: string;
        battery: number;
        connected: boolean;
        locked: boolean;
        lastConnected: Date;
    };
    style: ViewStyle;
}
export function VehicleCard({ vehicle, style }: VehicleCardProps): React.JSX.Element {
    const navigator = useNavigation();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Card style={style}>
            <View style={styles.header}>
                <View>
                    <Title>{vehicle.model}</Title>
                    <Description>BLE Unlock Std • Auto-lock enabled</Description>
                </View>
                <View>
                    <LoadingButton label={vehicle.connected ? 'Disconnect' : 'Connect'} isLoading={isLoading} onPress={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 3e3); }} />
                </View>
            </View>
            <View style={styles.quickInfo}>
                <View>
                    <ConnectionIndicator connected={vehicle.connected} />
                    <LockIndicator locked={vehicle.locked} />
                    <BatterIndicator battery={vehicle.battery} />
                    <LastSeenIndicator date={vehicle.lastConnected} />
                </View>
                <View style={styles.lockButtons}>
                    <IconButton icon={<Unlock size={16} />} />
                    <IconButton icon={<Lock size={16} />} />
                </View>
            </View>
            <View>
                <IconButton icon={<Settings size={16} />} label="Device Settings" onPress={() => navigator.navigate('Device Settings')} />
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quickInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
    },
    lockButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    indicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});
