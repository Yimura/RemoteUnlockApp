import React from 'react';
import { ActivityIndicator, View, ViewProps } from 'react-native';
import { Color } from '../../theme/Color';

interface LoadingViewProps extends ViewProps {
    loading?: boolean;
}

export function LoadingView({ children, loading = false, ...props }: LoadingViewProps): React.JSX.Element {
    return (
        <View {...props}>
            {loading ? <ActivityIndicator size={'large'} color={Color.Blue} /> : children}
        </View>
    );
}
