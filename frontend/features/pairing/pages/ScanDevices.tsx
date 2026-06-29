import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RefreshCcw, SearchX } from 'lucide-react-native';
import { Device } from 'react-native-ble-plx';
import { Button } from '@/components/core/Button';
import { ProgressBar } from '@/components/core/ProgressBar';
import { Description, Title } from '@/components/text';
import { Color } from '@/theme/Color';
import { BorderColor, SmallTextColor, TextColor } from '@/theme/Theme';
import { PairContainer } from '../components/PairContainer';
import { ScannedDevice } from '../components/ScannedDevice';
import { usePaginator } from '../components/paginator';
import { usePairDeviceStore } from '../stores/pairDeviceStore';
import { useBleDeviceScan } from '../hooks';

const LIST_MAX_HEIGHT = 280;

export function ScanDevices(): React.JSX.Element {
    const { selectedDevice, selectDevice } = usePairDeviceStore();
    const { devices, progress, scanning, rescan } = useBleDeviceScan({
        serviceUUID: '7ccf30e3-a9af-45b2-8d1d-f58e4d30ff95',
    });

    const { setNextEnabled, setNextButtonLabel } = usePaginator();
    useEffect(() => {
        setNextButtonLabel('Connect');

        return () => {
            setNextButtonLabel(null);
        };
    }, [setNextButtonLabel]);

    // Reconcile Next-enabled with the persisted selection so re-entering this
    // page with a device already chosen does not gray out the Connect button.
    useEffect(() => {
        setNextEnabled(!!selectedDevice);
    }, [selectedDevice, setNextEnabled]);

    const setSelectDevice = (device: Device) => {
        selectDevice(device);
    };

    const list = [...devices.values()];
    const showEmpty = !scanning && list.length === 0;

    return (
        <PairContainer>
            <View style={styles.heading}>
                <Title>Scan for devices</Title>
                <Description style={styles.subTitle}>
                    Tap the device you want to pair from the list below.
                </Description>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>
                        {scanning ? 'Scanning…' : 'Available devices'}
                    </Text>
                    <Text style={styles.countChip}>{list.length}</Text>
                </View>
                {scanning && <ProgressBar progress={progress} trackStyle={styles.progressTrack} />}
            </View>

            {showEmpty ? (
                <View style={styles.empty}>
                    <SearchX size={28} color={SmallTextColor} />
                    <Text style={styles.emptyTxt}>No devices found nearby.</Text>
                    <Button
                        onPress={rescan}
                        style={({ pressed }) => StyleSheet.flatten([
                            styles.retryBtn,
                            pressed ? styles.retryBtnPressed : null,
                        ])}>
                        <RefreshCcw size={16} color={Color.White} />
                        <Text style={styles.retryBtnTxt}>Scan again</Text>
                    </Button>
                </View>
            ) : (
                <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator>
                    {list.map((d) => (
                        <ScannedDevice
                            key={d.id}
                            deviceName={d.localName || d.name || d.id}
                            selected={d.id === selectedDevice?.id}
                            onPress={() => setSelectDevice(d)} />
                    ))}
                </ScrollView>
            )}
        </PairContainer>
    );
}

const styles = StyleSheet.create({
    heading: {
        width: '100%',
        gap: 4,
    },
    subTitle: {
        fontSize: 13,
        lineHeight: 18,
    },
    section: {
        width: '100%',
        gap: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionLabel: {
        color: TextColor,
        fontWeight: '600',
    },
    countChip: {
        color: SmallTextColor,
        fontSize: 12,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: BorderColor,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        minWidth: 24,
        textAlign: 'center',
    },
    progressTrack: {
        backgroundColor: Color.Blue,
    },
    list: {
        width: '100%',
        maxHeight: LIST_MAX_HEIGHT,
    },
    listContent: {
        gap: 8,
        paddingVertical: 4,
    },
    empty: {
        width: '100%',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 24,
    },
    emptyTxt: {
        color: SmallTextColor,
    },
    retryBtn: {
        backgroundColor: Color.Blue,
        borderColor: Color.Blue,
        paddingHorizontal: 16,
        alignSelf: 'stretch',
    },
    retryBtnPressed: {
        backgroundColor: Color.OffBlue,
        borderColor: Color.OffBlue,
    },
    retryBtnTxt: {
        color: Color.White,
        fontWeight: '600',
    },
});
