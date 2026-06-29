import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export const useOnForegroundFocus = (
    onFocus: () => void,
    runOnStartup: boolean = false
): void => {
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                onFocus();
            }

            appState.current = nextAppState;
        });

        if (runOnStartup) {
            onFocus();
        }

        return () => {
            subscription?.remove();
        };
        // effect installs an AppState listener once; onFocus changes are intentionally not tracked.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
