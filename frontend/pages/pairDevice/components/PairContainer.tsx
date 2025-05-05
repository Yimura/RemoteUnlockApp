import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
import { Color } from '../../../theme/Color';
import { Title } from '../../../components/text';
import { LucideIcon } from 'lucide-react-native';

interface PairContainerProps extends ViewProps {
}

interface PairContainerIconProps extends ViewProps {
    IconComponent: LucideIcon;
    color?: string;
    size?: number;
}

interface PairContainerTitleProps {
    text: string;
}

function PairContainer({ children, ...props }: PairContainerProps): React.JSX.Element {

    return (
        <View {...props} style={styles.container}>
            {children}
        </View>
    );
}

function PairContainerIcon({ IconComponent, color = Color.Blue, size = 32 }: PairContainerIconProps): React.JSX.Element {
    return (
        <View style={styles.iconWrapper}>
            <IconComponent color={color} size={size} />
        </View>
    );
}

function PairContainerTitle({ text }: PairContainerTitleProps): React.JSX.Element {
    return (
        <Title style={styles.centerText}>{text}</Title>
    );
}

function PairContainerSubTitle({ text }: PairContainerTitleProps): React.JSX.Element {
    return (
        <Text style={styles.centerText}>{text}</Text>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 8,
        alignItems: 'center',
        width: '100%',
    },
    centerText: {
        textAlign: 'center',
    },
    iconWrapper: {
        backgroundColor: Color.FadedBlue,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 32,
    },
});

PairContainer.Icon = PairContainerIcon;
PairContainer.SubTitle = PairContainerSubTitle;
PairContainer.Title = PairContainerTitle;

export {
    PairContainer,
};
