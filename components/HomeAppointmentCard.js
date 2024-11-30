import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

export default function HomeAppointmentCard() {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('Appointments'); // Navigate to Appointments screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dental Concerns?</Text>
      <TouchableOpacity onPress={handlePress}>
        <Text style={styles.textHighlight}>Book an Appointment Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 28,
    backgroundColor: '#F8F9FA', // Light background color for contrast
    borderRadius: 10, // Rounded corners
    shadowColor: '#009688', // Teal shadow color to match theme
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4, // Android shadow effect
    alignItems: 'center', // Center-align text
    marginVertical: 10, // Space around the card
  },
  text: {
    fontSize: 23,
    fontWeight: '600', // Semi-bold for emphasis
    color: '#009688', // Teal text color to match theme
    textAlign: 'flex-start',
    marginBottom: 4, // Small spacing between the two text elements
  },
  textHighlight: {
    fontSize: 23,
    fontWeight: 'bold', // Bold to make the call to action stand out
    color: '#009688', // Teal color to match theme
    textAlign: 'center',
    textDecorationLine: 'underline', // Underline to indicate a link
  },
});
