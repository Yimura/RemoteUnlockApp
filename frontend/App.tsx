import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import {
    StyleSheet,
    // useColorScheme,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Core } from './Core';

function App(): React.JSX.Element {
    // const _isDarkMode = useColorScheme() === 'dark';

    const Stack = createNativeStackNavigator();

    return (
        <SafeAreaProvider style={styles.body}>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Core" component={Core} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    body: {
        backgroundColor: '#f1f1f1',
    },
});

export default App;
