import { useNavigation } from '@react-navigation/native';
import { RootNavigationScreenProps } from '../Routes';

export const useRootNavigation = (): RootNavigationScreenProps['navigation'] => {
    return useNavigation<RootNavigationScreenProps['navigation']>();
};
