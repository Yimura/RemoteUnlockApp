import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from 'screens/HomeScreen';
import { SettingsScreen } from 'screens/SettingsScreen';
import { DeviceScreen } from 'screens/DeviceScreen';

const Tab = createBottomTabNavigator();

export default function BottomNavigator() {
    return (
        <Tab.Navigator initialRouteName='Home' screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Devices" component={DeviceScreen} options={{ title: "Devices" }} />
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
            <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
        </Tab.Navigator>
    );
}
