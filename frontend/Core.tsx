import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Car, Settings } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

interface TabBarIconProps {
    focused: boolean;
    color: string;
    size: number;
}

export const Core = (): React.JSX.Element => {
    const Tab = createBottomTabNavigator();

    const carIcon = (props: TabBarIconProps) => <Car {...props} />;
    const settingsIcon = (props: TabBarIconProps) => <Settings {...props} />;

    return (
        <Tab.Navigator>
            <Tab.Screen
                name="My Vehicles"
                component={View}
                options={{ tabBarIcon: carIcon }}
            />
            <Tab.Screen
                name="Settings"
                component={View}
                options={{ tabBarIcon: settingsIcon }}
            />
        </Tab.Navigator>
    );
};
