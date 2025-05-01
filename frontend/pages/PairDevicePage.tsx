import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/core/Card';
import { IconButton } from '../components/core/IconButton';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Color } from '../theme/Color';
import { Welcome } from './pairDevice/Welcome';
import { BluetoothPermission } from './pairDevice/BluetoothPermission';
import { usePairDeviceStore } from '../stores/pairDeviceStore';


export function PairDevicePage(): React.JSX.Element {
    const pages: React.ReactNode[] = [<Welcome />, <BluetoothPermission />, <View />];
    const [step, setStep] = useState(1);

    const { nextEnabled } = usePairDeviceStore();

    const setPreviousStep = useCallback(() => {
        if (step !== 0) {
            setStep(step - 1);
        }
    }, [step]);

    const setNextStep = useCallback(() => {
        if (!nextEnabled) {
            return;
        }

        if (step < pages.length - 1) {
            setStep(step + 1);
        }
    }, [nextEnabled, step, pages.length]);

    return (
        <View style={styles.container}>
            <Card style={styles.carouselCard}>
                <View style={styles.carouselHeader}>
                    <Text style={styles.carouselProgress}>Step {step + 1} / {pages.length}</Text>
                </View>
                <View style={styles.carouselBody}>
                    {pages[step]}
                </View>
                <View style={styles.carouselFooter}>
                    <View style={styles.carouselFooterButtons}>
                        {step !== 0 &&
                            <IconButton
                                label="Back"
                                icon={<ChevronLeft size={16} />}
                                onPress={setPreviousStep}
                            />
                        }
                        {step < pages.length &&
                            <IconButton
                                style={styles.nextButton}
                                textStyle={styles.nextButtonTxt}
                                label="Next"
                                icon={<ChevronRight size={16} color={Color.White} />}
                                right={true}
                                onPress={setNextStep}
                                disabled={!nextEnabled}
                            />
                        }
                    </View>
                    <View style={styles.carouselPageIndicators}>
                        {pages.map((_, idx) => <View key={idx} style={[styles.carouselPageIndicator, idx === step ? { backgroundColor: Color.Blue } : { backgroundColor: Color.BrokenWhite }]} />)}
                    </View>
                </View>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    carouselCard: {
        width: '90%',
        minHeight: '50%',
        overflow: 'hidden',
    },
    carouselHeader: {
        alignItems: 'flex-end',
    },
    carouselProgress: {
        color: Color.Grey,
    },
    carouselBody: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselFooter: {
        gap: 16,
    },
    carouselFooterButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    carouselPageIndicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    carouselPageIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    nextButton: {
        backgroundColor: Color.Black,
    },
    nextButtonTxt: {
        color: Color.White,
    },
});
