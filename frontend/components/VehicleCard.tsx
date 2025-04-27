import React from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';
import { IconButton } from './core/IconButton';
import { BatteryMedium, Circle, Clock4, Lock, Settings, Unlock } from 'lucide-react-native';
import { Button } from './core/Button';

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

export function VehicleCard(): React.JSX.Element {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>BMW X5</Text>
                    <Text style={styles.description}>BLE Unlock Std • Auto-lock enabled</Text>
                </View>
                <View>
                    <Button onPress={() => { }}>
                        <Text>Disconnect</Text>
                    </Button>
                </View>
            </View>
            <View style={styles.quickInfo}>
                <View>
                    <Indicator color="rgb(22 163 74)" icon={<Circle color="rgb(22 163 74)" size={10} />} label="Connected" />
                    <Indicator color="rgb(37 99 235)" icon={<Circle color="rgb(37 99 235)" size={10} />} label="Locked" />
                    <Indicator color="" icon={<BatteryMedium color="rgb(22 163 74)" size={12} />} label="92%" />
                    <Indicator color="#888" icon={<Clock4 color="#888" size={12} />} label="11 days ago" />
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
