import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PaginatorBodyProps {
    activePage: React.ReactNode;
}

export function PaginatorBody({ activePage }: PaginatorBodyProps): React.JSX.Element {
    return (
        <View style={styles.body}>
            {activePage}
        </View>
    );
}

const styles = StyleSheet.create({
    body: {
        alignItems: 'center',
    },
});
