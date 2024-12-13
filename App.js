import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './lib/supabase'; // Assuming you have your supabase instance
import { StatusBar } from 'react-native'; // Import StatusBar
import LogIn from './screens/LogIn';
import SignUp from './screens/SignUp';
import BottomTabNavigator from './navigation/BottomTabNavigator'; // Regular user tab navigator
import AdminBottomTabNavigator from './navigation/AdminBottomTabNavigator'; // Admin bottom tab navigator
import DentistBottomNavigator from './navigation/DentistBottomNavigator'; // Dentist bottom tab navigator
import WelcomeUser from './components/WelcomeUser'; // Import WelcomeUser screen

// Importing the new service screens
import Pediatrics from './screens/Pediatrics';
import Restorative from './screens/Restorative';
import Prosthodontics from './screens/Prosthodontics';
import Orthodontics from './screens/Orthodontics';

const ADMIN_EMAIL = 'silitrash0000@gmail.com';
const DENTIST_EMAIL = 'vincentson.dev@gmail.com';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null); // Manage user state
  const [loading, setLoading] = useState(true); // Loading state for session check

  useEffect(() => {
    const fetchSession = async () => {
      // Use getSession to fetch the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
      } else {
        setUser(session?.user || null);
      }

      // Subscribe to auth state changes (when user logs in/out)
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });

      setLoading(false);

      return () => {
        authListener?.unsubscribe();
      };
    };

    fetchSession();
  }, []);

  // Sign-out function to reset navigation stack and navigate to login screen
  const handleSignOut = async (navigation) => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error.message);
    } else {
      // Reset navigation stack and navigate to login
      setUser(null);
      navigation.reset({
        index: 0, // Reset to the first screen in the stack
        routes: [{ name: 'LogIn' }], // Navigate directly to LogIn screen
      });
    }
  };

  if (loading) {
    return null; // Optionally, you can show a loading spinner here if needed
  }

  // Function to determine the correct initial screen based on user email
  const getInitialRoute = () => {
    if (!user) {
      return 'LogIn'; // Default to LogIn if no user is authenticated
    }

    if (user.email === ADMIN_EMAIL) {
      return 'AdminHome'; // Navigate to Admin screens
    }

    if (user.email === DENTIST_EMAIL) {
      return 'DentistHome'; // Navigate to Dentist Bottom Tab Navigator
    }

    return 'Main'; // Default to regular user navigation
  };

  return (
    <>
      <StatusBar 
        barStyle="dark-content" // Adjust to light-content if the background is dark
        backgroundColor="transparent" 
        translucent 
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={getInitialRoute()}
          screenOptions={{ headerShown: false }}
        >
          {/* Login screen */}
          <Stack.Screen
            name="LogIn"
            component={LogIn}
            options={{
              headerShown: false,
              gestureEnabled: false, // Disable back swipe on login screen
            }}
          />
          {/* Sign-up screen */}
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{ headerShown: false }}
          />
          {/* Welcome User Screen */}
          <Stack.Screen
            name="WelcomeUser"
            component={WelcomeUser}
            options={{ headerShown: false }}
          />

          {/* Regular User Navigator */}
          <Stack.Screen
            name="Main"
            component={BottomTabNavigator} // Regular User Tab Navigator
            options={{ headerShown: false }}
          />

          {/* Admin Navigator */}
          <Stack.Screen
            name="AdminHome"
            component={AdminBottomTabNavigator} // Admin Bottom Tab Navigator
            options={{ headerShown: false }}
          />

          {/* Dentist Navigator */}
          <Stack.Screen
            name="DentistHome"
            component={DentistBottomNavigator} // Dentist Bottom Tab Navigator
            options={{ headerShown: false }}
          />

          {/* Service detail screens */}
          <Stack.Screen name="Pediatrics" component={Pediatrics} />
          <Stack.Screen name="Restorative" component={Restorative} />
          <Stack.Screen name="Prosthodontics" component={Prosthodontics} />
          <Stack.Screen name="Orthodontics" component={Orthodontics} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
