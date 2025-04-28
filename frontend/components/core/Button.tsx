import React from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';
import type { PressableStateCallbackType } from 'react-native';
import { BgColor, BorderColor } from '../../theme/Theme';

export interface ButtonProps extends PressableProps { }
export function Button(props: ButtonProps): React.JSX.Element {
    const setStyle = ({ pressed }: PressableStateCallbackType) => {
        if (typeof props.style === 'function') {
            return StyleSheet.flatten([styles.button, pressed ? styles.buttonTouch : {}, props.style({ pressed })]);
        }

        return StyleSheet.flatten([props.style, styles.button, pressed ? styles.buttonTouch : {}]);
    };

    return (
        <Pressable {...props} style={setStyle} />
    );
}

const styles = StyleSheet.create({
    button: {
        borderWidth: 1,
        borderColor: BorderColor,
        padding: 8,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,

        borderRadius: 4,
    },
    buttonTouch: {
        backgroundColor: BgColor,
    },
});
