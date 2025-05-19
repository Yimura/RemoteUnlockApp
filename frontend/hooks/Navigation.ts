import { useNavigation } from '@react-navigation/native';
import { BottomNavigationScreenProps, RootNavigationScreenProps } from '../Routes';

export function useBottomNavigation(): BottomNavigationScreenProps['navigation'] {
    return useNavigation<BottomNavigationScreenProps['navigation']>();
}

export function useRootNavigation(): RootNavigationScreenProps['navigation'] {
    return useNavigation<RootNavigationScreenProps['navigation']>();
}
