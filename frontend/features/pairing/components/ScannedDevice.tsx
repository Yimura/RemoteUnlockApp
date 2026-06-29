import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, RadioReceiver } from 'lucide-react-native';
import { Color } from '@/theme/Color';
import { BorderColor, TextColor } from '@/theme/Theme';

interface ScannedDeviceProps {
    deviceName: string;
    selected: boolean;
    onPress: () => void;
}
export function ScannedDevice({ deviceName, selected, onPress }: ScannedDeviceProps): React.JSX.Element {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => StyleSheet.flatten([
                styles.row,
                selected ? styles.rowSelected : null,
                pressed && !selected ? styles.rowPressed : null,
            ])}>
            <View style={[styles.iconWrap, selected ? styles.iconWrapSelected : null]}>
                <RadioReceiver size={18} color={selected ? Color.Blue : Color.Grey} />
            </View>
            <Text style={[styles.name, selected ? styles.nameSelected : null]} numberOfLines={1}>
                {deviceName}
            </Text>
            {selected && <Check size={18} color={Color.Blue} />}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: BorderColor,
        borderRadius: 8,
        backgroundColor: Color.White,
    },
    rowSelected: {
        backgroundColor: Color.WashedBlue,
        borderColor: Color.Blue,
    },
    rowPressed: {
        backgroundColor: Color.OffWhite,
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Color.BrokenWhite,
    },
    iconWrapSelected: {
        backgroundColor: Color.FadedBlue,
    },
    name: {
        flex: 1,
        color: TextColor,
        fontWeight: '500',
    },
    nameSelected: {
        color: Color.Blue,
        fontWeight: '600',
    },
});
