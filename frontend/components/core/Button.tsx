import React from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';
import type { PressableStateCallbackType } from 'react-native';


export function Button(props: PressableProps): React.JSX.Element {
    const setStyle = ({ pressed }: PressableStateCallbackType) => {
        return StyleSheet.flatten([styles.button, pressed ? styles.buttonTouch : {}]);
    };

    return (
        <Pressable {...props} style={setStyle} />
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
    buttonTouch: {
        backgroundColor: '#f8f8f8',
    },
});
