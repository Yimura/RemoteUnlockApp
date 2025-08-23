import { Description, Title } from '@/components/text';
import React from 'react';
import { View } from 'react-native';

export function SettingsHeader(): React.JSX.Element {
    return (
        <View>
            <Title>App Settings</Title>
            <Description>Configure how the application behaves.</Description>
        </View>
    );
}
