import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNavigator from 'components/BottomNavigator';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DeviceScreen from 'screens/DeviceScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name='root' component={BottomNavigator} />
          <Stack.Screen name='deviceScreen' component={DeviceScreen} options={{ headerShown: true }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
};
