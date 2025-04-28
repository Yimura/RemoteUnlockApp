import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { CardBgColor } from '../../theme/Theme';
import { BrokenWhite } from '../../theme/Color';

export interface CardProps extends ViewProps { }

export function Card(props: CardProps): React.JSX.Element {
    return (
        <View {...props} style={StyleSheet.flatten([styles.card, props.style])} />
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: CardBgColor,
        padding: 16,

        borderColor: BrokenWhite,
        borderWidth: 1,
        borderRadius: 8,
    },
});
