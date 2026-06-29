import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DeviceSettingsPage, Navigator, PairDevicePage, RootStackParamList } from './Routes';
import { ProximitySettingsPage } from '@/features/proximity/pages/proximity-settings-page';
import { MainBgColor } from '@/theme/Theme';


function App(): React.JSX.Element {
    const Stack = createNativeStackNavigator<RootStackParamList>();

    return (
        <SafeAreaProvider>
            <StatusBar barStyle="dark-content" backgroundColor={MainBgColor} />
            <NavigationContainer>
                <Stack.Navigator screenOptions={(props) => { return { headerShown: props.route.name !== 'MainNavigator' }; }}>
                    <Stack.Screen name="MainNavigator" component={Navigator} />
                    <Stack.Screen name="Device Settings" component={DeviceSettingsPage} />
                    <Stack.Screen name="Bluetooth Device Pairing" component={PairDevicePage} />
                    <Stack.Screen name="Proximity Settings" component={ProximitySettingsPage} options={{ presentation: 'modal' }} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

export default App;
