import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/core/Card';
import { IconButton } from '../components/core/IconButton';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Color } from '../theme/Color';
import { usePairDeviceStore } from '../stores/pairDeviceStore';
import { useNavigation } from '@react-navigation/native';


export function PairDevicePage(): React.JSX.Element {
    const { nextEnabled, currentPage, gotToPreviousPage, goToNextPage, pages, setLastPageCallback, reset } = usePairDeviceStore();
    const { Node, previousButtonLabel, nextButtonLabel } = pages[currentPage];

    const navigation = useNavigation();

    useEffect(() => {
        setLastPageCallback(() => {
            navigation.goBack();
        });

        return () => {
            reset();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={styles.container}>
            <Card style={styles.carouselCard}>
                <View style={styles.carouselHeader}>
                    <Text style={styles.carouselStep}>Step {currentPage + 1} / {pages.length}</Text>
                </View>
                <View style={styles.carouselBody}>
                    {Node}
                </View>
                <View style={styles.carouselFooter}>
                    <View style={styles.carouselFooterButtons}>
                        {currentPage !== 0 &&
                            <IconButton
                                label={previousButtonLabel || 'Back'}
                                icon={<ChevronLeft size={16} />}
                                onPress={gotToPreviousPage}
                            />
                        }
                        {currentPage < pages.length &&
                            <IconButton
                                style={styles.nextButton}
                                textStyle={styles.nextButtonTxt}
                                label={nextButtonLabel || 'Next'}
                                icon={<ChevronRight size={16} color={Color.White} />}
                                right={true}
                                onPress={goToNextPage}
                                disabled={!nextEnabled}
                            />
                        }
                    </View>
                    <View style={styles.carouselPageIndicators}>
                        {pages.map((_, idx) => <View key={idx} style={[styles.carouselPageIndicator, idx === currentPage ? { backgroundColor: Color.Blue } : { backgroundColor: Color.BrokenWhite }]} />)}
                    </View>
                </View>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselCard: {
        width: '90%',
    },
    carouselHeader: {
        alignItems: 'flex-end',
    },
    carouselStep: {
        color: Color.Grey,
    },
    carouselBody: {
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
