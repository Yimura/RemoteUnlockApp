import React, { ReactElement } from 'react';
import { PressableProps, Text, ViewStyle } from 'react-native';
import { Button } from './Button';


interface IconButtonProps extends PressableProps {
    icon: ReactElement;
    label?: string;
    style?: ViewStyle;
    onPress?: () => void;
    onLongPress?: () => void;
}

export function IconButton({ icon, label, style, onPress, onLongPress }: IconButtonProps): React.JSX.Element {

    return (
        <Button style={style} onPress={onPress} onLongPress={onLongPress}>
            {icon}
            {label && <Text>{label}</Text>}
        </Button>
    );
}
