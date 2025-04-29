import React from 'react';
import { StyleSheet, View } from 'react-native';
import DropdownSelect from 'react-native-input-select';
import { Black, BrokenWhite, Grey, White } from '../../theme/Color';
import { Check, ChevronDown } from 'lucide-react-native';
import { DropdownProps } from 'react-native-input-select/lib/typescript/src/types/index.types';

export function Dropdown(props: DropdownProps): React.JSX.Element {
    return (
        <View style={styles.dropdownWrapper}>
            <DropdownSelect
                {...props}
                dropdownContainerStyle={styles.dropdownContainer}
                dropdownStyle={styles.dropdown}
                dropdownIcon={<ChevronDown color={Grey} />}
                dropdownIconStyle={styles.dropdownIcon}
                listComponentStyles={{
                    itemSeparatorStyle: {
                        display: 'none',
                    },
                }}
                checkboxControls={{
                    checkboxStyle: { borderWidth: 0, backgroundColor: Grey, marginRight: 8 },
                    checkboxComponent: <Check color={White} size={14} />,
                }}
                labelStyle={styles.dropdownLabel}
                dropdownHelperTextStyle={styles.dropdownHelperText}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    dropdownWrapper: {
        gap: 8,
    },
    dropdownContainer: {
        marginBottom: 0, // who made this 40 by default ???
    },
    dropdown: {
        borderWidth: 1,
        borderColor: BrokenWhite,
        backgroundColor: 'transparent',
        minHeight: 0, // ???
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    dropdownIcon: {
        top: 6, // yay magic alignment values
        right: 10, // yay magic alignment values
    },
    dropdownLabel: {
        fontSize: 14,
        color: Black,
        marginBottom: 8,
    },
    dropdownHelperText: {
        fontSize: 10,
        color: Grey,
        marginTop: 8,
    },
});
