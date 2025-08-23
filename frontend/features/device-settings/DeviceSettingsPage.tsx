import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '../../components/core/Card';
import { Color } from '../../theme/Color';
import { Description, Title } from '../../components/text';
import { Button } from '../../components/core/Button';
import { SettingItem } from '../../components/settings/SettingItem';
import { Slider } from '../../components/core/Slider';
import { useDeviceStore } from '../../stores/deviceStore';
import { RemoveDevice } from './components';
import { DeviceConnectionToggle } from '@/components/device';

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
    const [proximityThreshold, setProximityThreshold] = useState(5);

    const updateDevice = async () => {
        if (device) {
            try {
                await device.settings.setName(deviceName);
            } catch (error) {
                console.error(error);
            }
        }
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
                <View>
                    <SettingItem label="Automatic Lock/Unlock" description="Automatically lock/unlock based on proximity." value={true} />
                </View>
                <View>
                    <Text>Proximity Threshold ({proximityThreshold}m)</Text>
                    <Slider
                        minimumValue={1}
                        maximumValue={9}
                        step={1}

                        onValueChange={([value]) => setProximityThreshold(value)}
                        value={proximityThreshold}
                    />
                    <Description>The vehicle will unlock when you are closer than this distance and lock when you move further away.</Description>
                </View>
                <Button style={({ pressed }) => pressed ? styles.saveBtnPressed : styles.saveBtn} onPress={updateDevice}>
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
