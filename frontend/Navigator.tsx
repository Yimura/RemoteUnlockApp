import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Car, Settings } from 'lucide-react-native';
import React from 'react';
import { MyVehiclesPage } from './pages/MyVehiclesPage';
import { SettingsPage } from './pages/SettingsPage';
import { BottomTabParamList } from './Routes';

interface TabBarIconProps {
    focused: boolean;
    color: string;
    size: number;
}

export const Navigator = (): React.JSX.Element => {
    const Tab = createBottomTabNavigator<BottomTabParamList>();

    const carIcon = (props: TabBarIconProps) => <Car {...props} />;
    const settingsIcon = (props: TabBarIconProps) => <Settings {...props} />;

    return (
        <Tab.Navigator>
            <Tab.Screen
                name="My Vehicles"
                component={MyVehiclesPage}
                options={{ tabBarIcon: carIcon }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsPage}
                options={{ tabBarIcon: settingsIcon }}
            />
        </Tab.Navigator>
    );
};
