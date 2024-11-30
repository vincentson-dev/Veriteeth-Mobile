// screens/Pediatrics.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Pediatrics() {
  return (
    <View style={styles.container}>
      <Text>Pediatrics Service Details</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
