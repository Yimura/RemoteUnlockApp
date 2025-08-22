import { Color } from '@/theme/Color';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PaginatorHeaderProps {
    currentPage: number;
    numberOfPages: number;
}
export function PaginatorHeader({ currentPage, numberOfPages }: PaginatorHeaderProps): React.JSX.Element {
    return (
        <View style={styles.paginatorHeader}>
            <Text style={styles.paginatorStep}>Step {currentPage} / {numberOfPages}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    paginatorHeader: {
        alignItems: 'flex-end',
    },
    paginatorStep: {
        color: Color.Grey,
    },
});
