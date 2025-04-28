import React from 'react';
import { StyleSheet, SwitchProps, Text, View } from 'react-native';
import { Switch } from '../core/Switch';
import { Description } from '../text/Description';

export interface SettingItemProps {
    label: string;
    description: string;
    onChange?: SwitchProps['onChange'];
    value?: boolean;
}

export function SettingItem({ label, description, onChange, value }: SettingItemProps): React.JSX.Element {
    return (
        <View style={styles.settingItem}>
            <View style={styles.settingItemText}>
                <Text>{label}</Text>
                <Description>{description}</Description>
            </View>
            <View>
                <Switch onChange={onChange} value={value} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    settingItemText: {
        flex: 1,
    },
});
