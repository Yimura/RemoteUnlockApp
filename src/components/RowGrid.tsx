import { StyleSheet, View, ViewProps } from "react-native"

const styles = StyleSheet.create({
    rowGrid: {
        flex: 2,
        flexDirection: 'column',
        justifyContent: 'space-between'
    }
});

export default function RowGrid({ children, style, ...rest }: ViewProps) {
    return (
        <View style={[styles.rowGrid, style]} {...rest}>{children}</View>
    );
};
