import { Button } from '@/components/core/Button';
import { Card } from '@/components/core/Card';
import { Description, Title } from '@/components/text';
import { useRootNavigation } from '@/hooks';
import { Color } from '@/theme/Color';
import { Plus, RadioReceiver } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const NoDevicesPaired = (): React.JSX.Element => {
    const navigation = useRootNavigation();

    return (
        <View style={styles.wrap}>
            <Card style={styles.card}>
                <View style={styles.iconWrap}>
                    <RadioReceiver size={32} color={Color.Blue} />
                </View>
                <View style={styles.text}>
                    <Title style={styles.title}>No devices paired</Title>
                    <Description style={styles.description}>
                        Pair a vehicle to control its locks and configure proximity-based behaviour.
                    </Description>
                </View>
                <Button
                    onPress={() => navigation.navigate('Bluetooth Device Pairing')}
                    style={({ pressed }) => StyleSheet.flatten([
                        styles.btn,
                        pressed ? styles.btnPressed : null,
                    ])}>
                    <Plus size={16} color={Color.White} />
                    <Text style={styles.btnTxt}>Pair new device</Text>
                </Button>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: {
        padding: 16,
        paddingTop: 48,
    },
    card: {
        gap: 16,
        alignItems: 'center',
        padding: 24,
    },
    iconWrap: {
        padding: 16,
        borderRadius: 40,
        backgroundColor: Color.FadedBlue,
    },
    text: {
        alignItems: 'center',
        gap: 4,
    },
    title: {
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 18,
    },
    btn: {
        backgroundColor: Color.Blue,
        borderColor: Color.Blue,
        alignSelf: 'stretch',
        paddingHorizontal: 16,
    },
    btnPressed: {
        backgroundColor: Color.OffBlue,
        borderColor: Color.OffBlue,
    },
    btnTxt: {
        color: Color.White,
        fontWeight: '600',
    },
});
