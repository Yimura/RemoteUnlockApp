import { Check, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { PairContainer } from './components/PairContainer';
import { Card } from '../../components/core/Card';
import { StyleSheet, Text, View } from 'react-native';
import { List } from '../../components/core/List';
import { Description } from '../../components/text';
import { Button } from '../../components/core/Button';
import { usePairDeviceStore } from '../../stores/pairDeviceStore';
import { Color } from '../../theme/Color';
import { BLEService } from '../../services/BLEService';
import { useNavigation } from '@react-navigation/native';

export function BluetoothPermission(): React.JSX.Element {
    const navigation = useNavigation();
    const { setNextEnabled } = usePairDeviceStore();
    const [hasPermissions, setPermissions] = useState(false);

    BLEService.hasPermissions().then(hasPermission => {
        setPermissions(hasPermission);
    });

    useEffect(() => {
        setNextEnabled(hasPermissions);

        return () => {
            setNextEnabled(true);
        };

        // Disable the eslist-next-line so that this effect can be run onmount, which doesn't require dependencies.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasPermissions]);

    const userConsent = async () => {
        const result = await BLEService.requestPermissions();

        setNextEnabled(result);
    };

    return (
        <PairContainer>
            <PairContainer.Icon IconComponent={Search} />
            <PairContainer.Title text="Allow Bluetooth Scanning" />
            <PairContainer.SubTitle text="To discover nearby devices, we need permission to scan for Bluetooth devices." />

            <Card style={styles.permissionCard}>
                <Text>This app would like to:</Text>
                <List ListDecorator={Check}>
                    <Text>Scan for nearby Bluetooth devices</Text>
                    <Text>Access device information (name, id)</Text>
                    <Text>Connect to selected devices</Text>
                </List>
                <Description>We only use this information to help you connect to your devices. We don't store or share this data.</Description>
                <View style={styles.permissionButtons}>
                    <Button style={styles.permissionButton} onPress={navigation.goBack}>
                        <Text>Deny</Text>
                    </Button>
                    <Button style={({ pressed }) => [styles.permissionButton, pressed ? styles.allowButtonPressed : styles.allowButton]} onPress={userConsent}>
                        <Text style={styles.allowText}>Allow</Text>
                    </Button>
                </View>
            </Card>
        </PairContainer>
    );
}

const styles = StyleSheet.create({
    permissionCard: {
        backgroundColor: Color.OffWhite,
    },
    permissionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    permissionButton: {
        marginTop: 12,
        flexGrow: 1,
        backgroundColor: Color.White,
    },
    allowButton: {
        backgroundColor: Color.Black,
    },
    allowButtonPressed: {
        backgroundColor: Color.OffBlack,
    },
    allowText: {
        color: Color.White,
    },
});
