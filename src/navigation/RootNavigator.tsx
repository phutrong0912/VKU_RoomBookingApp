import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { BottomTabNavigator } from './BottomTabNavigator';
import { RoomDetailScreen } from '../screens/RoomDetailScreen';
import { BookingSuccessScreen } from '../screens/BookingSuccessScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen
        name="RoomDetail"
        component={RoomDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BookingSuccess"
        component={BookingSuccessScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

