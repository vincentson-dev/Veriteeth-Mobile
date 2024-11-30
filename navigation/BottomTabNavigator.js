import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../components/Home';  // Adjust the path as necessary
import Profile from '../components/Profile'; // Your Profile component
import Appointments from '../components/Appointments'; // Your Appointments component
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  // Check if any screen is focused
  const isFocused = useIsFocused();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false, // Hide labels
        tabBarActiveTintColor: 'turquoise', // Set the active color
        tabBarInactiveTintColor: 'black', // Set the inactive color
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
            return <AntDesign name={iconName} size={28} color={color} />;
          } else if (route.name === 'Profile') {
            iconName = 'user-o';
            return <FontAwesome name={iconName} size={28} color={color} />;
          } else if (route.name === 'Appointments') {
            iconName = 'calendar';
            return <Ionicons name="calendar-outline" size={28} color={color} />;
          }
        },
        tabBarStyle: {
          position: 'absolute',  // Makes it easier to position the tab bar
          bottom: 20,  // Adjust this value to move the tab bar higher
          left: 20,  // Optional: Add some margin to the sides
          right: 20, // Optional: Add some margin to the sides
          borderRadius: 20, // Optional: Give the tab bar rounded corners
          height: 60,  // Optional: Adjust the height of the tab bar
          backgroundColor: 'white',  // Optional: Customize background color
          display: isFocused ? 'flex' : 'none', // Hide the tab bar when not focused
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={Home}
        options={{ headerShown: false }} // Hide header for Home screen
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={{ headerShown: false }} // Hide header for Profile screen
      />
      <Tab.Screen 
        name="Appointments" 
        component={Appointments}
        options={{ headerShown: false }} // Hide header for Appointments screen
      />
    </Tab.Navigator>
  );
}
