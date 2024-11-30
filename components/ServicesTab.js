import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

// Update this path according to where your icons are located
const icons = {
  Pediatrics: require('../assets/icons/Pediatrics.png'),
  Restorative: require('../assets/icons/Restorative.png'),
  Prosthodontics: require('../assets/icons/Prosthodontics.png'),
  Orthodontics: require('../assets/icons/Orthodontics.png'),
};

const services = [
  { name: 'Pediatrics', icon: icons.Pediatrics },
  { name: 'Restorative', icon: icons.Restorative },
  { name: 'Prosthodontics', icon: icons.Prosthodontics },
  { name: 'Orthodontics', icon: icons.Orthodontics },
];

export default function ServicesTab() {
  const navigation = useNavigation();

  const handlePress = (serviceName) => {
    navigation.navigate(serviceName); // Navigate to the corresponding service screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Our Services</Text>
      <View style={styles.servicesContainer}>
        {services.map((service, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.serviceButton}
            onPress={() => handlePress(service.name)} // Handle button press
          >
            <View style={styles.iconContainer}>
              <Image 
                source={service.icon} 
                style={styles.icon} 
              />
            </View>
            <Text style={styles.serviceText}>{service.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8F9FA', // Light background for better contrast
    shadowColor: '#009688', // Teal color for the shadow
    shadowOffset: { width: 0, height: 4 }, // Adjust vertical shadow offset
    shadowOpacity: 0.5, // Shadow opacity
    shadowRadius: 6, // Shadow radius
    elevation: 5, // For Android shadow effect
    borderRadius: 10, // Slightly rounded corners for the container
    overflow: 'hidden', // Prevents shadow bleeding to the sides
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'flex-start',
  },
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  serviceButton: {
    backgroundColor: '#009688',
    borderRadius: 30, // Rounded corners for the buttons
    width: 75, // Reduced width for smaller buttons
    height: 75, // Reduced height for smaller buttons
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 7,
    padding: 10, // Added padding inside the button for spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: 5,
  },
  icon: {
    width: 30, // Maintain original icon size or adjust as needed
    height: 30,
    resizeMode: 'contain',
  },
  serviceText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
  },
});
