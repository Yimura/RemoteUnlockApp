import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useOnForegroundFocus } from '@/hooks';
import { useDeviceStore } from '@/stores/deviceStore';
import { MainBgColor } from '@/theme/Theme';
import { ServiceHealthBanner } from '@/features/proximity/components/service-health-banner';
import { ProximityModule } from '@/features/proximity/services/proximity-module';
import { useProximityStore } from '@/features/proximity/stores/proximity-store';
import { DeviceCard, NoDevicesPaired } from './components';

export function MyVehiclesPage(): React.JSX.Element {
    const { devices, refresh, isRefreshing } = useDeviceStore();
    const configs = useProximityStore((s) => s.configs);
    const setStore = useProximityStore((s) => s.set);

    useOnForegroundFocus(refresh, true);

    useEffect(() => {
        let cancelled = false;
        Promise.all(devices.map((d) => ProximityModule.getConfig(d.ble.id))).then((cfgs) => {
            if (cancelled) return;
            devices.forEach((d, i) => setStore(d.ble.id, cfgs[i]));
        });
        return () => { cancelled = true; };
    }, [devices, setStore]);

    const anyEnabled = devices.some((d) => configs[d.ble.id]?.enabled);

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
