import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Title } from '../../components/text';
import { Bluetooth } from 'lucide-react-native';
import { Blue, FadedBlue } from '../../theme/Color';

export function Welcome(): React.JSX.Element {
    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                <Bluetooth color={Blue} size={32} />
            </View>
            <Title style={styles.centerText}>Device Bluetooth Pairing</Title>
            <Text style={styles.centerText}>We'll guide you through the process of connecting your Bluetooth device to your mobile device. Make sure your device is turned on and nearby.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 8,
        alignItems: 'center',
    },
    centerText: {
        textAlign: 'center',
    },
    iconWrapper: {
        backgroundColor: FadedBlue,
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 32,
        marginBottom: 8,
    },
});
