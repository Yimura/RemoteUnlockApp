import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/core/Card';
import { IconButton } from '../components/core/IconButton';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Blue, BrokenWhite, Grey, White } from '../theme/Color';
import { Welcome } from './pair_device/Welcome';


export function PairDevicePage(): React.JSX.Element {
    const pages: React.ReactNode[] = [<Welcome />];
    const [step, setStep] = useState(0);

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
                        {step !== 0 && <IconButton label="Back" icon={<ChevronLeft size={16} />} />}
                        {step < pages.length && <IconButton label="Next" icon={<ChevronRight size={16} color={White} />} right={true} />}
                    </View>
                    <View style={styles.carouselPageIndicators}>
                        {pages.map((_, idx) => <View style={[styles.carouselPageIndicator, idx === step ? { backgroundColor: Blue } : { backgroundColor: BrokenWhite }]} />)}
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
        color: Grey,
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
});
