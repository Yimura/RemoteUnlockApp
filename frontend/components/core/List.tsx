import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Color } from '../../theme/Color';

interface ListItemProps {
    item: React.ReactNode;
    ListDecorator: LucideIcon;
}
const ListItem = ({ ListDecorator, item }: ListItemProps): React.JSX.Element => {
    return (
        <View style={styles.listItem}>
            <ListDecorator color={Color.Blue} size={20} />
            {item}
        </View>
    );
};

interface ListProps extends ViewProps {
    children: React.JSX.Element[];
    ListDecorator: LucideIcon;
}
export function List({ ListDecorator, children, ...props }: ListProps): React.JSX.Element {
    return (
        <View style={styles.list} {...props}>
            {children.map((item, idx) => <ListItem key={idx} item={item} ListDecorator={ListDecorator} />)}
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
});
