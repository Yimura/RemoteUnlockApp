import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import {
    StyleSheet,
    // useColorScheme,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigator } from './Navigator';
import { MainBgColor } from './theme/Theme';

function App(): React.JSX.Element {
    // const _isDarkMode = useColorScheme() === 'dark';

    const Stack = createNativeStackNavigator();

    return (
        <SafeAreaProvider style={styles.body}>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="MainNavigator" component={Navigator} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    body: {
        backgroundColor: MainBgColor,
    },
});

export default App;
