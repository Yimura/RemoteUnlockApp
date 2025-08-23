import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { DeviceCard } from '@/components/device/DeviceCard';
import { useDeviceStore } from '@/stores/deviceStore';
import { MainBgColor } from '@/theme/Theme';
import { NoDevicesPaired } from './components';

export function MyVehiclesPage(): React.JSX.Element {
    const { devices, refresh, isRefreshing } = useDeviceStore();

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
