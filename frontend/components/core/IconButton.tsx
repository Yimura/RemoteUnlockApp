import React, { ReactElement } from 'react';
import { PressableProps, Text, TextStyle } from 'react-native';
import { Button } from './Button';


interface IconButtonProps extends PressableProps {
    icon: ReactElement;
    label?: string;
    textStyle?: TextStyle;
    onPress?: () => void;
    onLongPress?: () => void;
}

export function IconButton({ icon, label, style, textStyle, onPress, onLongPress }: IconButtonProps): React.JSX.Element {

    return (
        <Button style={style} onPress={onPress} onLongPress={onLongPress}>
            {icon}
            {label && <Text style={textStyle}>{label}</Text>}
        </Button>
    );
}
