import React, { ReactElement } from 'react';
import { PressableProps, Text, TextStyle } from 'react-native';
import { Button } from './Button';


interface IconButtonProps extends PressableProps {
    icon: ReactElement;
    right?: boolean;
    label?: string;
    textStyle?: TextStyle;
}

export function IconButton({ icon, label, right = false, style, textStyle, ...props }: IconButtonProps): React.JSX.Element {

    return (
        <Button style={style} {...props}>
            {!right && icon}
            {label && <Text style={textStyle}>{label}</Text>}
            {right && icon}
        </Button>
    );
}
