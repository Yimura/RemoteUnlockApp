import { RemoteUnlockDevice } from '@/ble/RemoteUnlockDevice';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/core/Card';
import { IconButton } from '@/components/core/IconButton';
import { Description, Title } from '@/components/text';
import { useDeviceStore } from '@/stores/deviceStore';
import { Color } from '@/theme/Color';
import { TextColor } from '@/theme/Theme';
import { useNavigation } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RemoveDeviceProps {
    device: RemoteUnlockDevice;
}
export function RemoveDevice({ device }: RemoveDeviceProps): React.JSX.Element {
    const navigation = useNavigation();
    const { remove } = useDeviceStore();
    const [confirming, setConfirming] = useState(false);

    const deviceName = device.ble.localName || 'Unknown device';

    const deleteDevice = () => {
        remove(device.ble.id);
        device.ble.cancelConnection();
        setConfirming(false);
        navigation.goBack();
    };

    return (
        <>
            <Card style={styles.deviceRemove}>
                <View>
                    <Title style={styles.dangerTitle}>Danger Zone</Title>
                    <Description>Remove this device from your paired devices.</Description>
                </View>
                <IconButton
                    icon={<Trash2 size={16} color={Color.White} />}
                    label="Remove Device"
                    style={({ pressed }) => pressed ? styles.deviceRemoveBtnPressed : styles.deviceRemoveBtn}
                    textStyle={styles.deviceRemoveBtnTxt}
                    onPress={() => setConfirming(true)} />
            </Card>

            <Modal
                transparent
                visible={confirming}
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setConfirming(false)}>
                <Pressable style={styles.backdrop} onPress={() => setConfirming(false)} />
                <SafeAreaView edges={['top', 'bottom']} style={styles.safe} pointerEvents="box-none">
                    <Card style={styles.confirmCard}>
                        <View>
                            <Title style={styles.dangerTitle}>Remove device?</Title>
                            <Description>
                                This will unpair "{deviceName}" from this app. The device itself
                                stays untouched and can be re-paired later.
                            </Description>
                        </View>
                        <View style={styles.confirmActions}>
                            <Button
                                onPress={() => setConfirming(false)}
                                style={({ pressed }) => StyleSheet.flatten([
                                    styles.cancelBtn,
                                    pressed ? styles.cancelBtnPressed : null,
                                ])}>
                                <Text style={styles.cancelBtnTxt}>Cancel</Text>
                            </Button>
                            <Button
                                onPress={deleteDevice}
                                style={({ pressed }) => StyleSheet.flatten([
                                    styles.confirmBtn,
                                    pressed ? styles.confirmBtnPressed : null,
                                ])}>
                                <Trash2 size={16} color={Color.White} />
                                <Text style={styles.confirmBtnTxt}>Remove</Text>
                            </Button>
                        </View>
                    </Card>
                </SafeAreaView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    deviceRemove: {
        borderColor: Color.Red,
        borderWidth: 1,
        gap: 16,
    },
    dangerTitle: {
        color: Color.Red,
    },
    deviceRemoveBtn: {
        backgroundColor: Color.Red,
        borderColor: Color.Red,
    },
    deviceRemoveBtnPressed: {
        backgroundColor: Color.OffRed,
        borderColor: Color.OffRed,
    },
    deviceRemoveBtnTxt: {
        color: Color.White,
        fontWeight: '600',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Color.OffBlack,
    },
    safe: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    confirmCard: {
        gap: 16,
        borderColor: Color.Red,
        borderWidth: 1,
    },
    confirmActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    cancelBtnPressed: {
        backgroundColor: Color.OffWhite,
    },
    cancelBtnTxt: {
        color: TextColor,
        fontWeight: '600',
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: Color.Red,
        borderColor: Color.Red,
    },
    confirmBtnPressed: {
        backgroundColor: Color.OffRed,
        borderColor: Color.OffRed,
    },
    confirmBtnTxt: {
        color: Color.White,
        fontWeight: '600',
    },
});
