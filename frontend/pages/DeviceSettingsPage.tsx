import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '../components/core/Card';
import { Color } from '../theme/Color';
import { IconButton } from '../components/core/IconButton';
import { Trash2 } from 'lucide-react-native';
import { Title } from '../components/text/Title';
import { Description } from '../components/text/Description';
import { Button } from '../components/core/Button';
import { SettingItem } from '../components/settings/SettingItem';
import { Slider } from '../components/core/Slider';

export function DeviceSettingsPage(): React.JSX.Element {
    const [deviceName, setDeviceName] = useState('BMW E36');
    const [proximityThreshold, setProximityThreshold] = useState(5);

    return (
        <View style={styles.container}>
            <Card style={styles.deviceSettings}>
                <View style={styles.deviceSettingsHeader}>
                    <View>
                        <Title>Device Information</Title>
                        <Description>Configure your device settings</Description>
                    </View>
                    <Button>
                        <Text>Disconnect</Text>
                    </Button>
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
                <Button style={({ pressed }) => pressed ? styles.saveBtnPressed : styles.saveBtn}>
                    <Text style={styles.saveTxt}>Save Changes</Text>
                </Button>
            </Card>
            <Card style={styles.deviceRemove}>
                <View>
                    <Title style={{ color: Color.Red }}>Danger Zone</Title>
                    <Description>Remove this device from your paired devices.</Description>
                </View>
                <IconButton icon={<Trash2 size={16} color={Color.White} />} label="Remove Device" style={({ pressed }) => pressed ? styles.deviceRemoveBtnPressed : styles.deviceRemoveBtn} textStyle={styles.deviceRemoveBtnTxt} />
            </Card>
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
    deviceRemove: {
        borderColor: Color.Red,
        borderWidth: 1,

        gap: 16,
    },
    deviceRemoveBtn: {
        backgroundColor: Color.Red,
    },
    deviceRemoveBtnPressed: {
        backgroundColor: Color.OffRed,
    },
    deviceRemoveBtnTxt: {
        color: Color.White,
    },
});
