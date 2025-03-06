/* eslint-disable prettier/prettier */
import React from 'react';
import MainScreen from '../Views/MainScreen';
import Map from '../Views/Map';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function Navigate() {
    return <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name = "Main"
                    component={MainScreen}
                    options={{title: 'Погода'}}
                />
                <Stack.Screen
                    name = "Map"
                    component={Map}
                    options={{title: 'Карта'}}
                />
            </Stack.Navigator>
    </NavigationContainer>;
}