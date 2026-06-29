import { Check, Search } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { PairContainer } from '../components/PairContainer';
import { Card } from '@/components/core/Card';
import { StyleSheet, Text, View } from 'react-native';
import { List } from '@/components/core/List';
import { Description } from '@/components/text';
import { Button } from '@/components/core/Button';
import { Color } from '@/theme/Color';
import { useNavigation } from '@react-navigation/native';
import { usePaginator } from '../components/paginator';
import { hasBluetoothPermissions, requestBluetoothPermissions } from '@/util/Bluetooth';
import { ForcedLoader } from '../components/ForcedLoader';

export function BluetoothPermission(): React.JSX.Element {
    const navigation = useNavigation();
    const { currentPage, setPage, setNextEnabled, setNextButtonLabel } = usePaginator();

    useEffect(() => {
        setNextButtonLabel('Continue');
        setNextEnabled(false);

        return () => {
            setNextButtonLabel(null);
            setNextEnabled(true);
        };
    }, [setNextButtonLabel, setNextEnabled]);

    const goToNextPage = (evaluated: boolean) => {
        if (evaluated) {
            setPage(currentPage + 1);
        }
    };

    const userConsent = async () => {
        const result = await requestBluetoothPermissions();

        setNextEnabled(result);
    };

    return (
        <PairContainer>
            <PairContainer.Icon IconComponent={Search} />
            <PairContainer.Title text="Allow Bluetooth Scanning" />
            <PairContainer.SubTitle text="To discover nearby devices, we need permission to scan for Bluetooth devices." />

            <ForcedLoader stateCheck={hasBluetoothPermissions} timeoutCallback={goToNextPage}>
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
            </ForcedLoader>
        </PairContainer>
    );
}

const styles = StyleSheet.create({
    permissionCard: {
        backgroundColor: Color.OffWhite,
        gap: 8,
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
        backgroundColor: Color.Blue,
        borderColor: Color.Blue,
    },
    allowButtonPressed: {
        backgroundColor: Color.OffBlue,
        borderColor: Color.OffBlue,
    },
    allowText: {
        color: Color.White,
        fontWeight: '600',
    },
});
