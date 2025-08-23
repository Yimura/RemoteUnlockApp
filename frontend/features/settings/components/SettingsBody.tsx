import { Dropdown } from '@/components/core/Dropdown';
import { SettingItem } from '@/components/settings/SettingItem';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface SettingsBodyProps {

}
export function SettingsBody({ }: SettingsBodyProps): React.JSX.Element {
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
    );
}

const styles = StyleSheet.create({
    settingsItems: {
        gap: 8,
    },
});
