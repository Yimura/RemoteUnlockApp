import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Color } from '@/theme/Color';
import { Description, Title } from '@/components/text';

interface PairContainerProps extends ViewProps {
}

interface PairContainerIconProps extends ViewProps {
    IconComponent: LucideIcon;
    color?: string;
    backgroundColor?: string;
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

function PairContainerIcon({ IconComponent, color = Color.Blue, backgroundColor = Color.FadedBlue, size = 32 }: PairContainerIconProps): React.JSX.Element {
    return (
        <View style={[styles.iconWrapper, { backgroundColor }]}>
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
        <Description style={styles.subTitle}>{text}</Description>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        gap: 12,
        alignItems: 'center',
        width: '100%',
    },
    centerText: {
        textAlign: 'center',
    },
    subTitle: {
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 18,
    },
    iconWrapper: {
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
