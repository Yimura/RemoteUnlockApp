import { DeviceId } from 'react-native-ble-plx';
import { Navigator } from './Navigator';
import { DeviceSettingsPage } from './features/device-settings';
import { PairDevicePage } from './features/pairing';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
    'MainNavigator': undefined,
    'Device Settings': { id: DeviceId },
    'Bluetooth Device Pairing': undefined,
    'Proximity Settings': { mac: string },
};

export type RootNavigationScreenProps = NativeStackScreenProps<RootStackParamList, 'MainNavigator' | 'Device Settings' | 'Bluetooth Device Pairing' | 'Proximity Settings'>;

export type BottomTabParamList = {
    'My Vehicles': undefined,
    'Settings': undefined,
};

export type BottomNavigationScreenProps = BottomTabScreenProps<BottomTabParamList, 'My Vehicles' | 'Settings'>;

export { Navigator, DeviceSettingsPage, PairDevicePage };
