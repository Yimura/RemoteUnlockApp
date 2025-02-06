import { StyleSheet, View, ViewProps } from "react-native"

export default function ColumnGrid({ children, style, ...rest }: ViewProps) {
    const styles = StyleSheet.create({
        columnGrid: {
            flex: 2,
            flexDirection: 'row',
            justifyContent: 'space-between'
        }
    });

    return (
        <View style={[styles.columnGrid, style]} {...rest}>{children}</View >
    );
};
