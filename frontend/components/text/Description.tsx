import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { SmallTextColor } from '../../theme/Theme';

export function Description(props: TextProps): React.JSX.Element {
    return (
        <Text {...props} style={StyleSheet.flatten([styles.description, props.style])} />
    );
}

const styles = StyleSheet.create({
    description: {
        fontSize: 10,
        color: SmallTextColor,
    },
});
