import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useOnForegroundFocus } from '@/hooks';
import { useDeviceStore } from '@/stores/deviceStore';
import { MainBgColor } from '@/theme/Theme';
import { ServiceHealthBanner } from '@/features/proximity/components/service-health-banner';
import { ProximityModule } from '@/features/proximity/services/proximity-module';
import { DeviceCard, NoDevicesPaired } from './components';

export function MyVehiclesPage(): React.JSX.Element {
    const { devices, refresh, isRefreshing } = useDeviceStore();
    const [anyEnabled, setAnyEnabled] = useState(false);

    useOnForegroundFocus(refresh, true);

    useEffect(() => {
        Promise.all(devices.map(d => ProximityModule.getConfig(d.ble.id)))
            .then(cfgs => setAnyEnabled(cfgs.some(c => c.enabled)));
    }, [devices]);

    return (
        <View style={styles.container}>
            <ServiceHealthBanner anyEnabled={anyEnabled} />
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
