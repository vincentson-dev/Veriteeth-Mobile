import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase'; // Ensure you have supabase client configured

export default function WelcomeUser() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ first_name: '', last_name: '' });

  useEffect(() => {
    // Fetch user data when the component mounts
    async function fetchUserData() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        const user = sessionData?.session?.user;

        if (user) {
          const firstName = user.user_metadata?.first_name || '';
          setUserData({ first_name: firstName });
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#40E0D0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        <Text style={styles.welcomeLabel}>Welcome, </Text>
        <Text style={styles.userName}>Dr.{userData.first_name}!</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    height: 70,
    padding: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  welcomeText: {
    flexDirection: 'row', // Arrange "Welcome" and the name horizontally
    alignItems: 'center', // Center align vertically
  },
  welcomeLabel: {
    fontSize: 24, // Adjusted font size for "Welcome"
    color: '#009688', // White color for the welcome label
    fontWeight: '400', // Light weight for "Welcome"
  },
  userName: {
    fontSize: 30, // Larger font size for the first name
    color: '#009688', // White color for the user's name
    fontWeight: '900', // Bold text for emphasis
  },
});
