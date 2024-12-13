import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function ConfirmedAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch confirmed appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('id, type, appointment_time, first_name, last_name') // Select necessary fields
        .eq('confirmed_appointments', true);

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching confirmed appointments:', error.message);
      Alert.alert('Error', 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Mark as No Show
  const markAsNoShow = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ no_show: true })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointmentId)
      );

      Alert.alert('Marked as No Show', 'The appointment has been marked as no show.');
    } catch (error) {
      console.error('Error marking appointment as no show:', error.message);
      Alert.alert('Error', 'Failed to mark as no show.');
    }
  };

  // Mark as Completed
  const markAsCompleted = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ finished_appointments: true })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointmentId)
      );

      Alert.alert('Marked as Completed', 'The appointment has been marked as completed.');
    } catch (error) {
      console.error('Error marking appointment as completed:', error.message);
      Alert.alert('Error', 'Failed to mark as completed.');
    }
  };

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentContainer}>
      <Text style={styles.messageText}>
        Appointment: {item.type || 'Not specified'}
      </Text>
      <Text style={styles.subText}>
        Scheduled On: {new Date(item.appointment_time).toLocaleString()}
      </Text>
      <Text style={styles.subText}>
        Requested By: {item.first_name && item.last_name
          ? `${item.first_name} ${item.last_name}`
          : 'Unknown'}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.noShowButton]}
          onPress={() => markAsNoShow(item.id)}
        >
          <Text style={styles.buttonText}>Mark as No Show</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.completedButton]}
          onPress={() => markAsCompleted(item.id)}
        >
          <Text style={styles.buttonText}>Mark as Completed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#40E0D0" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <Text style={styles.title}>Confirmed Appointments</Text>
      {appointments.length === 0 ? (
        <View style={styles.noAppointmentsContainer}>
          <Text style={styles.noAppointmentsText}>No Confirmed Appointments.</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAppointment}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  appointmentContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '45%',
  },
  noShowButton: {
    backgroundColor: '#FF6347',
    borderWidth: 1,
    borderColor: '#FF6347',
    textAlign: 'center',
    justifyContent: 'center', // Align content vertically
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#009688',
    borderWidth: 1,
    borderColor: '#009688',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingBottom: 100,
  },
  noAppointmentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noAppointmentsText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
  },
});
