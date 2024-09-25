import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from 'screens/HomeScreen';
import { SettingsScreen } from 'screens/SettingsScreen';
import { DeviceScreen } from 'screens/DeviceScreen';
import Icon from '@react-native-vector-icons/ionicons';

const Tab = createBottomTabNavigator();

export default function BottomNavigator() {
    const getRouteIcon = (routeName: string, { focused, color, size }: { focused: boolean, color: string, size: number }) => {
        let icon: string = "";
        switch (routeName) {
            case "Devices":
                icon = "bluetooth";
                break;
            case "Home":
                icon = "home";
                break;
            case "Settings":
                icon = "settings";
                break;
        }

        if (focused) {
            icon += "-outline";
        }

        return <Icon name={icon} size={size} color={color} />;
    };

    return (
        <Tab.Navigator initialRouteName='Home' screenOptions={
            ({ route }) => ({
                headerShown: false,
                tabBarIcon: (props) => getRouteIcon(route.name, props),
            })
        }>
            <Tab.Screen name="Devices" component={DeviceScreen} options={{ title: "Devices" }} />
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
            <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
        </Tab.Navigator>
    );
}
