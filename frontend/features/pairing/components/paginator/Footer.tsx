import { IconButton } from '@/components/core/IconButton';
import { Color } from '@/theme/Color';
import { TextColor } from '@/theme/Theme';
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

        if (currentPage === numberOfPages) {
            return;
        }
        setPage(newPage);
    };

    return (
        <View style={styles.footer}>
            {currentPage > 1 ? (
                <IconButton
                    label={previousButtonLabel || 'Back'}
                    icon={<ChevronLeft size={16} color={TextColor} />}
                    style={styles.backButton}
                    onPress={previousPage} />
            ) : (
                <View style={styles.backSpacer} />
            )}
            {currentPage <= numberOfPages && (
                <IconButton
                    style={({ pressed }: { pressed: boolean }) => StyleSheet.flatten([
                        styles.nextButton,
                        pressed ? styles.nextButtonPressed : null,
                        !isNextEnabled ? styles.nextButtonDisabled : null,
                    ])}
                    textStyle={styles.nextButtonTxt}
                    label={nextButtonLabel || 'Next'}
                    icon={<ChevronRight size={16} color={Color.White} />}
                    right={true}
                    onPress={nextPage}
                    disabled={!isNextEnabled} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    backSpacer: {
        flex: 0,
    },
    backButton: {
        backgroundColor: 'transparent',
        flexShrink: 0,
    },
    nextButton: {
        backgroundColor: Color.Blue,
        borderColor: Color.Blue,
        flex: 1,
        paddingHorizontal: 16,
    },
    nextButtonPressed: {
        backgroundColor: Color.OffBlue,
        borderColor: Color.OffBlue,
    },
    nextButtonDisabled: {
        opacity: 0.4,
    },
    nextButtonTxt: {
        color: Color.White,
        fontWeight: '600',
    },
});
