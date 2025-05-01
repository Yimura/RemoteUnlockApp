import { Slider as LibSlider, SliderProps } from '@miblanchard/react-native-slider';
import React from 'react';
import { Color } from '../../theme/Color';
import { StyleSheet } from 'react-native';


export function Slider(props: SliderProps): React.JSX.Element {
    return <LibSlider {...props}
        minimumTrackStyle={styles.minimumTrack}
        maximumTrackStyle={styles.maximumTrack}
        thumbStyle={styles.thumb}
        trackStyle={styles.track} />;
}

const styles = StyleSheet.create({
    minimumTrack: {
        backgroundColor: Color.Blue,
    },
    maximumTrack: {
        backgroundColor: Color.BrokenWhite,
    },
    thumb: {
        borderColor: Color.Blue,
        borderWidth: 2,
        backgroundColor: Color.White,
    },
    track: {
        height: 8,
        borderRadius: 4,
    },
});
