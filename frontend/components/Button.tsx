import React from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';


export function Button(props: PressableProps): React.JSX.Element {
    return (
        <Pressable {...props} style={styles.button} />
    );
}

const styles = StyleSheet.create({
    button: {
        borderWidth: 1,
        borderColor: '#f1f1f1',
        padding: 8,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,

        borderRadius: 4,
    },
});
