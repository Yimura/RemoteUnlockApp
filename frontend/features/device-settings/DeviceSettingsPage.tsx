import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '../../components/core/Card';
import { Color } from '../../theme/Color';
import { Description, Title } from '../../components/text';
import { Button } from '../../components/core/Button';
import { useDeviceStore } from '../../stores/deviceStore';
import { RemoveDevice } from './components';
import { DeviceConnectionToggle } from '@/components/device';
import { useSaveDeviceName } from './hooks';
import { useRootNavigation } from '@/hooks';

interface DeviceSettingsPageRoute {
    route: {
        params: {
            id: string
        }
    }
}

export function DeviceSettingsPage({ route }: DeviceSettingsPageRoute): React.JSX.Element {
    const { get } = useDeviceStore();
    const device = get(route.params.id)!;

    const [deviceName, setDeviceName] = useState(device?.ble.localName || 'Unknown');

    const { save } = useSaveDeviceName(device);
    const nav = useRootNavigation();

    const onSave = () => {
        save(deviceName);
    };

    return (
        <View style={styles.container}>
            <Card style={styles.deviceSettings}>
                <View style={styles.deviceSettingsHeader}>
                    <View>
                        <Title>Device Information</Title>
                        <Description>Configure your device settings</Description>
                    </View>
                    <DeviceConnectionToggle device={device} />
                </View>
                <View>
                    <Text>Device Name</Text>
                    <TextInput style={styles.input} onChangeText={setDeviceName} value={deviceName} />
                </View>
                <Pressable onPress={() => nav.navigate('Proximity Settings', { mac: device.ble.id })}>
                    <Text>Auto unlock / lock</Text>
                </Pressable>
                <Button style={({ pressed }) => pressed ? styles.saveBtnPressed : styles.saveBtn} onPress={onSave}>
                    <Text style={styles.saveTxt}>Save Changes</Text>
                </Button>
            </Card>
            <RemoveDevice device={device} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
    },
    deviceSettings: {
        gap: 16,
    },
    deviceSettingsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    input: {
        borderWidth: 1,
        borderRadius: 4,
        borderColor: Color.BrokenWhite,

        color: Color.Black,

        margin: 0,
        padding: 8,
    },
    saveTxt: {
        color: Color.White,
    },
    saveBtn: {
        backgroundColor: Color.Blue,
    },
    saveBtnPressed: {
        backgroundColor: Color.OffBlue,
    },
});
