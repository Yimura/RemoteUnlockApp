import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { ProximityModule } from '../services/proximity-module';

const STALE_MS = 5 * 60_000;

export function ServiceHealthBanner({ anyEnabled }: { anyEnabled: boolean }) {
    const [stale, setStale] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const hb = await ProximityModule.heartbeatAt();
            if (cancelled) return;
            if (anyEnabled && hb > 0 && Date.now() - hb > STALE_MS) setStale(true);
        })();
        return () => { cancelled = true; };
    }, [anyEnabled]);

    if (!stale) return null;

    return (
        <View style={{ backgroundColor: '#fee', padding: 12 }}>
            <Text>Auto-unlock may have been paused by the system.</Text>
            <Pressable
                onPress={() =>
                    Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS')
                }>
                <Text>Open battery settings</Text>
            </Pressable>
        </View>
    );
}
