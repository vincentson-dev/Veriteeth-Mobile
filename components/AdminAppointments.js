import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);

      // Fetch only pending appointments (those with pending_appointments = true, confirmed_appointments = null, cancelled_appointments = null)
      const { data: pendingAppointments, error: pendingError } = await supabase
        .from('appointments')
        .select('*')
        .eq('pending_appointments', true) // Only show pending appointments
        .is('confirmed_appointments', null) // No confirmed appointments
        .is('cancelled_appointments', null); // No cancelled appointments

      if (pendingError) throw pendingError;

      setAppointments(pendingAppointments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error.message);
      Alert.alert('Error', 'Failed to load appointments.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Function to handle confirming an appointment
  const confirmAppointment = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ confirmed_appointments: true, pending_appointments: false })
        .eq('id', appointmentId);

      if (error) throw error;

      // Remove the confirmed appointment from the list of pending appointments
      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment.id !== appointmentId)
      );

      Alert.alert('Success', 'Appointment confirmed!');
    } catch (error) {
      console.error('Error confirming appointment:', error.message);
      Alert.alert('Error', 'Failed to confirm the appointment.');
    }
  };

  // Function to handle canceling an appointment
  const cancelAppointment = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ cancelled_appointments: true, pending_appointments: false })
        .eq('id', appointmentId);

      if (error) throw error;

      // Remove the canceled appointment from the list of pending appointments
      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment.id !== appointmentId)
      );

      Alert.alert('Success', 'Appointment canceled!');
    } catch (error) {
      console.error('Error canceling appointment:', error.message);
      Alert.alert('Error', 'Failed to cancel the appointment.');
    }
  };

  const renderAppointment = ({ item, index }) => {
    const isRecent = index === 0;

    return (
      <View
        style={[
          styles.appointmentContainer,
          isRecent && styles.recentAppointment,
          item.isCancellationRequest && styles.cancellationRequest,
        ]}
      >
        <Text style={styles.messageText}>
          {item.isCancellationRequest
            ? `${item.user_name} has requested a cancellation`
            : item.message || 'Appointment Request'}
        </Text>
        <Text style={styles.subText}>
          Type of Appointment: {item.appointment_type || item.type || 'Not specified'}
        </Text>
        <Text style={styles.subText}>
          Scheduled On: {new Date(item.appointment_time || item.created_at).toLocaleString()}
        </Text>
        <Text style={styles.subText}>
          Requested By: {item.user_email || 'Unknown'}
        </Text>
        {item.isCancellationRequest && (
          <Text style={styles.subText}>
            Cancellation Reason: {item.cancellation_reason || 'No reason provided'}
          </Text>
        )}

        {/* Render buttons based on cancellation request or normal appointment */}
        {item.isCancellationRequest ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={() => confirmCancellation(item.id, item.appointment_type, item.user_id, item.user_email, item.user_name, item.cancellation_reason)}
            >
              <Text style={styles.buttonText}>Confirm Cancellation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => cancelCancellation(item.id)}
            >
              <Text style={styles.buttonText}>Cancel Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={() => confirmAppointment(item.id)}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => cancelAppointment(item.id)} // Updated here
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

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
      
      <Text style={styles.title}>Pending Appointments</Text>

      {appointments.length === 0 ? (
        <View style={styles.noAppointmentsContainer}>
          <Text style={styles.noAppointmentsText}>No Pending Appointments.</Text>
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
  recentAppointment: {
    backgroundColor: 'rgba(64, 224, 208, 0.2)',
  },
  cancellationRequest: {
    backgroundColor: 'rgba(255, 99, 71, 0.1)', // Light red tint for cancellation requests
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
  confirmButton: {
    backgroundColor: '#009688',
    borderWidth: 1,
    borderColor: '#009688',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    borderWidth: 1,
    borderColor: '#FF6347',
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
