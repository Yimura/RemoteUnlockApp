import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useOnForegroundFocus } from '@/hooks';
import { useDeviceStore } from '@/stores/deviceStore';
import { MainBgColor } from '@/theme/Theme';
import { DeviceCard, NoDevicesPaired } from './components';

export function MyVehiclesPage(): React.JSX.Element {
    const { devices, refresh, isRefreshing } = useDeviceStore();

    useOnForegroundFocus(refresh, true);

    return (
        <View style={styles.container}>
            <FlatList
                ListEmptyComponent={<NoDevicesPaired />}
                refreshing={isRefreshing}
                onRefresh={refresh}
                data={devices}
                renderItem={({ item }) => <DeviceCard device={item} style={styles.item} />}
                keyExtractor={item => item.ble.id} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: MainBgColor,
        height: '100%',
    },
    item: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
});
