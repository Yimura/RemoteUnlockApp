import React from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';

export interface IndicatorProps {
    color: ColorValue,
    icon: React.JSX.Element;
    label: string;
}
export function Indicator({ color, icon, label }: IndicatorProps): React.JSX.Element {
    return (
        <View style={styles.indicator}>
            {icon}
            <Text style={{ color }}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    indicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});
