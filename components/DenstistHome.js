import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase'; // Import Supabase client
import AppointmentCalendar from './AppointmentCalendar';
import AppointmentRecordHistory from './AppointmentRecordHistory';
import AdminWidget from './AdminWidget';
import MonthlyPatients from './MonthlyPatients';
import WelcomeUser from './WelcomeUser';

const DentistHome = () => {
  const navigation = useNavigation();

  // Sign-out function
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
      console.error('Sign-out error:', error.message);
    } else {
      Alert.alert('Signed out', 'You have been signed out successfully.');
      navigation.replace('LogIn'); // Navigate to LogIn screen
    }
    
  };

  return (
    <>
   <View>
    
    </View>  
    <View style={styles.container}>

              
              <AppointmentCalendar/>
              <AppointmentRecordHistory/>
              <AdminWidget/>
              <MonthlyPatients/>
      
      
    </View>
  </>
  );
};

export default DentistHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  signOutButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#009688',
    borderRadius: 8,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
