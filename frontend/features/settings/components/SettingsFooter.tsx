import { Button } from '@/components/core/Button';
import { Color } from '@/theme/Color';
import React from 'react';
import { Text, View } from 'react-native';

interface SettingsFooterProps {

}
export function SettingsFooter({ }: SettingsFooterProps): React.JSX.Element {
    return (
        <View>
            <Button style={({ pressed }) => pressed ? { backgroundColor: Color.OffBlue } : { backgroundColor: Color.Blue }}>
                <Text style={{ color: Color.OffWhite }}>Save Changes</Text>
            </Button>
        </View>
    );
}
