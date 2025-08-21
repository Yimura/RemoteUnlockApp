import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DeviceSettingsPage, Navigator, PairDevicePage, RootStackParamList } from './Routes';


function App(): React.JSX.Element {
    const Stack = createNativeStackNavigator<RootStackParamList>();

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator screenOptions={(props) => { return { headerShown: props.route.name !== 'MainNavigator' }; }}>
                    <Stack.Screen name="MainNavigator" component={Navigator} />
                    <Stack.Screen name="Device Settings" component={DeviceSettingsPage} />
                    <Stack.Screen name="Bluetooth Device Pairing" component={PairDevicePage} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

export default App;
