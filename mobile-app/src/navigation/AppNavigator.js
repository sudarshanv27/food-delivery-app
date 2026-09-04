import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import CartScreen from '../screens/CartScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ff4757',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Food Delivery', headerShown: false }}
        />
        <Stack.Screen 
          name="RestaurantDetail" 
          component={RestaurantDetailScreen} 
          options={{ title: 'Restaurant' }}
        />
        <Stack.Screen 
          name="Cart" 
          component={CartScreen} 
          options={{ title: 'My Cart' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;