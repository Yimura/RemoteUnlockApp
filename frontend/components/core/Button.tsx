import React from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';
import type { PressableStateCallbackType } from 'react-native';
import { BgColor, BorderColor } from '../../theme/Theme';

export interface ButtonProps extends PressableProps { }
export function Button({ style, disabled = false, ...props }: ButtonProps): React.JSX.Element {


    const setStyle = ({ pressed }: PressableStateCallbackType) => {
        if (typeof style === 'function') {
            return StyleSheet.flatten([styles.button, pressed ? styles.buttonTouch : {}, style({ pressed: disabled ? false : pressed })]);
        }

        return StyleSheet.flatten([style, styles.button, pressed && !disabled ? styles.buttonTouch : {}, disabled ? styles.buttonDisabled : {}]);
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

        borderRadius: 6,
    },
    buttonTouch: {
        backgroundColor: BgColor,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});
