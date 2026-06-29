import { useNavigation } from '@react-navigation/native';
import { BottomNavigationScreenProps } from '../Routes';

export const useBottomNavigation = (): BottomNavigationScreenProps['navigation'] => {
    return useNavigation<BottomNavigationScreenProps['navigation']>();
};
