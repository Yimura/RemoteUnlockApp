import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/core/Card';
import { Color } from '../theme/Color';
import { Button } from '../components/core/Button';
import { SettingItem } from '../components/settings/SettingItem';
import { Dropdown } from '../components/core/Dropdown';

export function SettingsPage(): React.JSX.Element {
    const scanIntervalOptions = [
        { label: '1 second (high battery consumption)', value: 1 },
        { label: '2 seconds', value: 2 },
        { label: '3 seconds', value: 3 },
        { label: '5 seconds (recommended)', value: 5 },
        { label: '10 seconds', value: 10 },
        { label: '30 seconds (lowest battery consumption)', value: 30 },
    ];
    const [scanInterval, setScanInterval] = useState(5);

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <View>
                    <Text style={styles.title}>App Settings</Text>
                    <Text style={styles.description}>Configure how the application behaves.</Text>
                </View>
                <View style={styles.settingsItems}>
                    <SettingItem label="Run in Background" description="Allow the app to run in the backgrund for auto-lock features." value={true} />
                    <SettingItem label="Notifications" description="Receive notifications when your vehicle is locked or unlocked" value={false} />
                    <Dropdown
                        label="Bluetooth Scan Interval"
                        helperText="How often the app checks for nearby devices when auto-lock is enabled."
                        options={scanIntervalOptions}
                        onValueChange={(value) => typeof value === 'number' && setScanInterval(value)}
                        selectedValue={scanInterval}
                    />
                </View>
                <View>
                    <Button style={({ pressed }) => pressed ? { backgroundColor: Color.OffBlue } : { backgroundColor: Color.Blue }}>
                        <Text style={{ color: Color.OffWhite }}>Save Changes</Text>
                    </Button>
                </View>
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
    title: {
        fontSize: 20,
        fontWeight: 600,
    },
    description: {
        fontSize: 12,
        color: Color.Grey,
    },
    settingsItems: {
        gap: 8,
    },
});
