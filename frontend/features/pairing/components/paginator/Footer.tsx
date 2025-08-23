import { IconButton } from '@/components/core/IconButton';
import { Color } from '@/theme/Color';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export type PageUpdateEventHandler = (page: number, numberOfPage: number) => void;

interface PaginatorFooterProps {
    currentPage: number;
    numberOfPages: number;
    setPage: (page: number) => void;

    previousButtonLabel: string | null;
    nextButtonLabel: string | null;

    isNextEnabled: boolean;

    onPageUpdate?: PageUpdateEventHandler;
}
export function PaginatorFooter({ currentPage, numberOfPages, setPage, previousButtonLabel, nextButtonLabel, isNextEnabled, onPageUpdate }: PaginatorFooterProps): React.JSX.Element {
    const previousPage = () => {
        const newPage = currentPage - 1;
        onPageUpdate?.(newPage, numberOfPages);

        if (newPage === 0) {
            return;
        }
        setPage(newPage);
    };

    const nextPage = () => {
        const newPage = currentPage + 1;
        onPageUpdate?.(newPage, numberOfPages);

        if (!isNextEnabled || currentPage === numberOfPages) {
            return;
        }
        setPage(newPage);
    };

    return (
        <View style={styles.carouselFooter}>
            <View style={styles.carouselFooterButtons}>
                {currentPage > 0 &&
                    <IconButton
                        label={previousButtonLabel || 'Back'}
                        icon={<ChevronLeft size={16} />}
                        onPress={previousPage}
                    />
                }
                {currentPage <= numberOfPages &&
                    <IconButton
                        style={styles.nextButton}
                        textStyle={styles.nextButtonTxt}
                        label={nextButtonLabel || 'Next'}
                        icon={<ChevronRight size={16} color={Color.White} />}
                        right={true}
                        onPress={nextPage}
                        disabled={!isNextEnabled}
                    />
                }
            </View>
            <View style={styles.carouselPageIndicators}>
                {[...Array(numberOfPages)].map((_, idx) =>
                    <View key={idx} style={[styles.carouselPageIndicator, { backgroundColor: idx === currentPage - 1 ? Color.Blue : Color.BrokenWhite }]} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
