import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

export function Title(props: TextProps): React.JSX.Element {
    return (
        <Text {...props} style={StyleSheet.flatten([styles.title, props.style])} />
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: 600,
    },
});
