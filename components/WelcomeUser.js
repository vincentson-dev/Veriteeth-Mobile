import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase'; // Ensure you have supabase client configured
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function WelcomeUser() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ first_name: '', last_name: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [errorMessage, setErrorMessage] = useState(''); // State for error message

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

  const handleSearchIconPress = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSearchQuery('');
    setErrorMessage('');
  };

  const handleSearchSubmit = () => {
    // Here you can replace with actual search logic
    const matches = searchQuery.length > 0; // Basic logic: if there's a query, it "matches"
    if (matches) {
      // Do your search logic here
      handleModalClose();
    } else {
      setErrorMessage(`"${searchQuery}" not found`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        <Text style={styles.welcomeLabel}>Welcome, </Text>
        <Text style={styles.userName}>{userData.first_name}!</Text>
      </Text>
      <TouchableOpacity onPress={handleSearchIconPress}>
        <FontAwesome style={styles.searchIcon} name="search" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={handleModalClose} style={styles.closeButton}>
              <FontAwesome name="times" size={18} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Looking for something?</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit} // Check query on submit
              placeholderTextColor="#888" // Light color for placeholder text
            />
            <TouchableOpacity onPress={handleSearchSubmit} style={styles.searchButton}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
            {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    padding: 10,
    borderRadius: 30, // Changed to make the corners more rounded
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#009688', // Changed to teal to match the white icon
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3, // Android shadow
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
    fontSize: 21, // Smaller font size for "Welcome"
    color: 'white', // White color for the welcome label
    fontWeight: 'normal', // Normal weight for "Welcome"
  },
  userName: {
    fontSize: 24, // Larger font size for the first name
    color: 'white', // White color for the user's name
    fontWeight: 'bold', // Bold text for emphasis
  },
  searchIcon: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker overlay
  },
  modalContent: {
    width: '85%', // Width set to 85% for a better appearance
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#FFF', // White background for the modal
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5, // Android shadow
    alignItems: 'center', // Center align elements in modal
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#009688', // Teal color for the title
    marginBottom: 15,
  },
  searchInput: {
    height: 60, // Increased height for more input space
    borderColor: '#009688', // Teal border color for input
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '100%', // Full width for input
  },
  searchButton: {
    backgroundColor: '#009688', // Teal color for the button
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    width: '100%', // Full width button
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});
