import { Color } from '@/theme/Color';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View, type ViewProps } from 'react-native';

export interface ForcedLoaderProps extends ViewProps {
    stateCheck: () => boolean | Promise<boolean>;
    timeoutCallback: (evaluated: boolean) => void;
    timeoutFailure?: number;
    timeoutSuccess?: number;
}

/**
 * ForcedLoader wraps React Elements into a forced loading animation with timeouts prior to rendering.
 * This makes the user experience less jarring when elements instantly pop-into view.
 * Separate success and failure timeouts are provided to tweak user experience based on a success condition from the stateCheck.
 * @param {ForcedLoaderProps} forcedLoaderProps
 * @returns {React.JSX.Element}
 */
export function ForcedLoader({ stateCheck, timeoutCallback, timeoutFailure = 250, timeoutSuccess = 1e3, children, ...props }: ForcedLoaderProps): React.JSX.Element {
    const [state, setState] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        (async () => {
            const evaluated = await stateCheck();
            timerRef.current = setTimeout(() => {
                timeoutCallback(evaluated);
                setState(true);
            }, evaluated ? timeoutSuccess : timeoutFailure);
        })();

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View {...props}>
            {state ? children : <ActivityIndicator size={'large'} color={Color.Blue} />}
        </View>
    );
}
