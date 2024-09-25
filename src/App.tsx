import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNavigator from 'components/BottomNavigator';
import { StatusBar } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar animated={true} barStyle={'dark-content'} backgroundColor={'#0000'} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name='root' component={BottomNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  )
};
