import { Color } from '@/theme/Color';
import { SmallTextColor } from '@/theme/Theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PaginatorHeaderProps {
    currentPage: number;
    numberOfPages: number;
}
export function PaginatorHeader({ currentPage, numberOfPages }: PaginatorHeaderProps): React.JSX.Element {
    return (
        <View style={styles.header}>
            <Text style={styles.step}>Step {currentPage} / {numberOfPages}</Text>
            <View style={styles.indicators}>
                {[...Array(numberOfPages)].map((_, idx) => (
                    <View
                        key={idx}
                        style={[
                            styles.indicator,
                            { backgroundColor: idx === currentPage - 1 ? Color.Blue : Color.BrokenWhite },
                            idx === currentPage - 1 ? styles.indicatorActive : null,
                        ]} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    step: {
        color: SmallTextColor,
        fontSize: 12,
        fontWeight: '600',
    },
    indicators: {
        flexDirection: 'row',
        gap: 6,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    indicatorActive: {
        width: 20,
    },
});
