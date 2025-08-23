import { RemoteUnlockDevice } from '@/ble/RemoteUnlockDevice';
import { Card } from '@/components/core/Card';
import { IconButton } from '@/components/core/IconButton';
import { Description, Title } from '@/components/text';
import { useDeviceStore } from '@/stores/deviceStore';
import { Color } from '@/theme/Color';
import { useNavigation } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface RemoveDeviceProps {
    device: RemoteUnlockDevice;
}
export function RemoveDevice({ device }: RemoveDeviceProps): React.JSX.Element {
    const navigation = useNavigation();
    const { remove } = useDeviceStore();

    const deleteDevice = () => {
        if (device) {
            remove(device.ble.id);

            device.ble.cancelConnection();
        }

        navigation.goBack();
    };

    return (
        <Card style={styles.deviceRemove}>
            <View>
                <Title style={{ color: Color.Red }}>Danger Zone</Title>
                <Description>Remove this device from your paired devices.</Description>
            </View>
            <IconButton
                icon={<Trash2 size={16} color={Color.White} />}
                label="Remove Device"
                style={({ pressed }) => pressed ? styles.deviceRemoveBtnPressed : styles.deviceRemoveBtn}
                textStyle={styles.deviceRemoveBtnTxt}
                onPress={deleteDevice}
            />
        </Card>
    );
}

const styles = StyleSheet.create({
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
