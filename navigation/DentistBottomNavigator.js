// navigation/DentistBottomTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DentistHome from '../components/DenstistHome'; // Import your DentistHome component
import DentistProfile from '../components/DenstistProfile'; // Import your DentistProfile component
import DentistAppointments from '../components/DentistAppointments'; // Import your DentistAppointments component
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function DentistBottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false, // Hide labels
        tabBarActiveTintColor: 'turquoise', // Set the active color
        tabBarInactiveTintColor: 'black', // Set the inactive color
        tabBarIcon: ({ color }) => {
          let iconName;
          if (route.name === 'DentistHome') {
            iconName = 'home';
            return <AntDesign name={iconName} size={28} color={color} />;
          } else if (route.name === 'DentistProfile') {
            iconName = 'user-o';
            return <FontAwesome name={iconName} size={28} color={color} />;
          } else if (route.name === 'DentistAppointments') {
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
        },
      })}
    >
      <Tab.Screen 
        name="DentistHome" 
        component={DentistHome} 
        options={{ headerShown: false }} // Hide header for this screen
      />
      <Tab.Screen 
        name="DentistProfile" 
        component={DentistProfile} 
        options={{ headerShown: false }} // Hide header for this screen
      />
      <Tab.Screen 
        name="DentistAppointments" 
        component={DentistAppointments} 
        options={{ headerShown: false }} // Hide header for this screen
      />
    </Tab.Navigator>
  );
}
