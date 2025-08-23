import { Button } from '@/components/core/Button';
import { Title } from '@/components/text';
import { useRootNavigation } from '@/hooks/Navigation';
import { Color } from '@/theme/Color';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface NoDevicesPairedProps {

}
export const NoDevicesPaired = ({ }: NoDevicesPairedProps): React.JSX.Element => {
    const navigation = useRootNavigation();

    return (
        <View style={styles.noDevicesPaired}>
            <Title>No devices paired</Title>
            <Text>Pair a new device to control your vehicle.</Text>
            <Button style={({ pressed }) => pressed ? styles.pairDeviceBtnPressed : styles.pairDeviceBtn} onPress={() => navigation.navigate('Bluetooth Device Pairing')}>
                <Text style={styles.pairDeviceBtnTxt}>Pair New Device</Text>
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    noDevicesPaired: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '90%',
        gap: 12,
        marginVertical: 12,
    },
    pairDeviceBtn: {
        backgroundColor: Color.Blue,
    },
    pairDeviceBtnTxt: {
        color: Color.White,
    },
    pairDeviceBtnPressed: {
        backgroundColor: Color.OffBlue,
    },
});
