import React from 'react';
import { ColorValue, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { IconButton } from './core/IconButton';
import { BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, Circle, Clock4, Lock, Settings, Unlock } from 'lucide-react-native';
import { Button } from './core/Button';
import { GetTimeAgo } from '../util/Time';

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
    const color = connected ? 'rgb(22 163 74)' : 'rgb(239 68 68)';
    const icon = <Circle color={color} size={10} />;

    return <Indicator color={color} icon={icon} label={connected ? 'Connected' : 'Disconnected'} />;
};

interface LockIndicatorProps {
    locked: boolean;
}
const LockIndicator = ({ locked }: LockIndicatorProps): React.JSX.Element => {
    const color = locked ? 'rgb(37 99 235)' : 'rgb(217 119 6)';
    const icon = <Circle color={color} size={10} />;

    return <Indicator color={color} icon={icon} label={locked ? 'Locked' : 'Unlocked'} />;
};

interface BatterIndicatorProps {
    battery: number;
}
const BatterIndicator = ({ battery }: BatterIndicatorProps): React.JSX.Element => {
    let color = 'rgb(22 163 74)';
    let icon = <BatteryCharging color={color} size={16} />;

    if (battery < 10.8) {
        color = 'rgb(239 68 68)';
        icon = <BatteryLow color={color} size={16} />;
    }
    else if (battery < 11.5) {
        color = 'rgb(217 119 6)';
        icon = <BatteryMedium color={color} size={16} />;
    }
    else if (battery < 13) {
        icon = <BatteryFull color={color} size={16} />;
    }

    return <Indicator color={color} icon={icon} label={`${Math.round(battery * 10) / 10}V`} />;
};

interface LastSeenIndicatorProps {
    date: Date;
}
const LastSeenIndicator = ({ date }: LastSeenIndicatorProps): React.JSX.Element => {
    const color = '#888';
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
    return (
        <View style={StyleSheet.flatten([styles.container, style])}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{vehicle.model}</Text>
                    <Text style={styles.description}>BLE Unlock Std • Auto-lock enabled</Text>
                </View>
                <View>
                    <Button onPress={() => { }}>
                        <Text>{vehicle.connected ? 'Disconnect' : 'Connect'}</Text>
                    </Button>
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
                <IconButton icon={<Settings size={16} />} label="Device Settings" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 600,
    },
    description: {
        fontSize: 10,
        color: '#888',
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
