import React, { useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Color } from '../../theme/Color';

interface ProgressBarProps {
    style?: ViewStyle;
    trackStyle?: ViewStyle;
    /** Progress [0.0, 1.0] */
    progress: number;
}
export function ProgressBar({ style, trackStyle, progress }: ProgressBarProps): React.JSX.Element {
    const ref = useRef<View>(null);
    const [maxWidth, setMaxWidth] = useState(0);

    useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }
        const { width } = ref.current?.unstable_getBoundingClientRect();
        setMaxWidth(width);
    }, []);

    return (
        <View ref={ref} style={[styles.progressBar, style]}>
            <View style={[styles.progressBarTrack, trackStyle, { width: maxWidth * progress }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    progressBar: {
        height: 4,
        backgroundColor: Color.BrokenWhite,
        borderRadius: 2,
        overflow: 'hidden',
        width: '100%',
    },
    progressBarTrack: {
        backgroundColor: Color.Black,
        height: '100%',
    },
});
