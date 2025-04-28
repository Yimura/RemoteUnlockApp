import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { CardBgColor } from '../../theme/Theme';

export interface CardProps extends ViewProps { }

export function Card(props: CardProps): React.JSX.Element {
    return (
        <View {...props} style={StyleSheet.flatten([styles.card, props.style])} />
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: CardBgColor,
    },
});
