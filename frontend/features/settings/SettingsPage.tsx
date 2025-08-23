import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/core/Card';
import { SettingsBody, SettingsFooter, SettingsHeader } from './components';

export function SettingsPage(): React.JSX.Element {
    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <SettingsHeader />
                <SettingsBody />
                <SettingsFooter />
            </Card>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    card: {
        gap: 16,
    },
});
