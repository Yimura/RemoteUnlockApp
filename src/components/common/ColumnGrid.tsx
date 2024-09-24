import { StyleSheet, View, ViewProps } from "react-native"

const styles = StyleSheet.create({
    columnGrid: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});

export default function ColumnGrid({ children, style, ...rest }: ViewProps) {
    return (
        <View style={[styles.columnGrid, style]} {...rest}>{children}</View >
    );
};
