import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/core/Card';
import { Blue, Grey, OffBlue, OffWhite } from '../theme/Color';
import { Button } from '../components/core/Button';
import { SettingItem } from '../components/settings/SettingItem';

export function SettingsPage(): React.JSX.Element {
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
                </View>
                <View>
                    <Button style={({ pressed }) => pressed ? { backgroundColor: OffBlue } : { backgroundColor: Blue }}>
                        <Text style={{ color: OffWhite }}>Save Changes</Text>
                    </Button>
                </View>
            </Card >
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
        color: Grey,
    },
    settingsItems: {
        gap: 8,
    },
});
