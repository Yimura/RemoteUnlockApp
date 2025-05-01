import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Text } from 'react-native-svg';
import { Color } from '../../theme/Color';

interface OrderListItemProps {
    index: number;
    item: React.ReactNode;
}
const OrderedListItem = ({ index, item }: OrderListItemProps): React.JSX.Element => {
    return (
        <View style={styles.listItem}>
            <Text>{index + 1}</Text>
            {item}
        </View>
    );
};

interface OrderedListProps extends ViewProps {
    children: React.ReactNode[];
}
export function OrderedList({ children }: OrderedListProps): React.JSX.Element {
    return (
        <View style={styles.list}>
            {children.map((item, idx) => <OrderedListItem key={idx} index={idx} item={item} />)}
        </View>
    );
}

const styles = StyleSheet.create({
    list: {
        justifyContent: 'center',
    },
    listItem: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    indexIndicator: {
        backgroundColor: Color.FadedBlue,
        color: Color.Blue,
        padding: 4,
        borderRadius: 4,
        textAlign: 'center',
    },
});
