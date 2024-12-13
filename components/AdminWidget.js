import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { supabase } from '../lib/supabase';

const screenWidth = Dimensions.get('window').width; // Get screen width
const widgetSize = (screenWidth - 48) / 4; // Adjust the widget size to fit 4 in a row

export default function AdminWidget() {
  const [pendingCount, setPendingCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [noShowCount, setNoShowCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0); // **State for completed appointments**
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [modalType, setModalType] = useState(''); // Initialize as an empty string to avoid null
  const [modalLoading, setModalLoading] = useState(false); // **Modal loading state**

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { firstDay, lastDay };
  };

  const fetchAppointmentsByType = async (type) => {
    try {
      setModalLoading(true); // Start loading animation
      const { firstDay, lastDay } = getCurrentMonthRange();
      let query;

      switch (type) {
        case 'pending':
          query = supabase
            .from('appointments')
            .select('*')  // Ensure first_name, last_name, and other fields are included
            .eq('pending_appointments', true)
            .is('confirmed_appointments', null);
          break;
        case 'confirmed':
          query = supabase
            .from('appointments')
            .select('*')  // Include first_name and last_name
            .eq('confirmed_appointments', 'true')
            .gte('appointment_time', firstDay.toISOString())
            .lte('appointment_time', lastDay.toISOString());
          break;
        case 'noShow':
          query = supabase
            .from('appointments')
            .select('*')  // Include first_name and last_name
            .eq('no_show', true);
          break;
        case 'completed':
          query = supabase
            .from('appointments')
            .select('*')  // Include first_name and last_name
            .eq('finished_appointments', true)
            .gte('appointment_time', firstDay.toISOString())
            .lte('appointment_time', lastDay.toISOString());
          break;
        default:
          return;
      }

      const { data, error } = await query;

      if (error) throw error;

      // Sort appointments by appointment_time in descending order (most recent first)
      const sortedAppointments = data.sort((a, b) => new Date(b.appointment_time) - new Date(a.appointment_time));

      setAppointments(sortedAppointments);  // Set sorted appointments
    } catch (error) {
      console.error('Error fetching appointments:', error.message);
    } finally {
      setModalLoading(false); // Stop loading animation
    }
  };

  const fetchAppointmentCounts = async () => {
    try {
      setLoading(true);

      const { firstDay, lastDay } = getCurrentMonthRange();

      const pendingPromise = supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('pending_appointments', true)
        .is('confirmed_appointments', null);

      const confirmedPromise = supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('confirmed_appointments', 'true')
        .gte('appointment_time', firstDay.toISOString())
        .lte('appointment_time', lastDay.toISOString());

      const noShowPromise = supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('no_show', true);

      const completedPromise = supabase  // **New fetch for completed appointments**
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('finished_appointments', true)
        .gte('appointment_time', firstDay.toISOString())
        .lte('appointment_time', lastDay.toISOString());

      const [pendingResult, confirmedResult, noShowResult, completedResult] = await Promise.all([
        pendingPromise,
        confirmedPromise,
        noShowPromise,
        completedPromise, // **Added the completed result to Promise.all**
      ]);

      if (pendingResult.error || confirmedResult.error || noShowResult.error || completedResult.error) {
        throw new Error('Error fetching appointment counts.');
      }

      setPendingCount(pendingResult.data.length);
      setConfirmedCount(confirmedResult.data.length);
      setNoShowCount(noShowResult.data.length);
      setCompletedCount(completedResult.data.length); // **Set the completed count**
    } catch (error) {
      console.error('Error fetching appointment counts:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentCounts(); // Fetch counts on component mount
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#40E0D0" />
      </View>
    );
  }

  const handleSquarePress = (type) => {
    setModalType(type);  // Set the modalType to the selected type
    setModalVisible(true);
    fetchAppointmentsByType(type);
  };

  const formatAppointmentDate = (appointmentTime) => {
    const date = new Date(appointmentTime);
    
    // Format the date as 'Month day, year'
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    });

    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `${formattedDate} at ${formattedTime}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.widget, styles.pending]}
        onPress={() => handleSquarePress('pending')}
      >
        <Text style={[styles.labelPending, styles.topLeft]}>Pending</Text>
        <Text style={[styles.count, { color: '#f5aa5b' }]}>{pendingCount}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.widget, styles.confirmed]}
        onPress={() => handleSquarePress('confirmed')}
      >
        <Text style={[styles.labelConfirmed, styles.topLeft]}>Confirmed</Text>
        <Text style={[styles.count, { color: '#009688' }]}>{confirmedCount}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.widget, styles.noShow]}
        onPress={() => handleSquarePress('noShow')}
      >
        <Text style={[styles.labelNoShow, styles.topLeft]}>No Show</Text>
        <Text style={[styles.count, { color: '#ff5733' }]}>{noShowCount}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.widget, styles.completed]}
        onPress={() => handleSquarePress('completed')}
      >
        <Text style={[styles.labelCompleted, styles.topLeft]}>Completed</Text>
        <Text style={[styles.count, { color: '#6ba3be' }]}>{completedCount}</Text>
      </TouchableOpacity>

      {/* Appointment Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.simpleModalContainer}>
            <Text style={styles.modalTitle}>
              {modalType ? modalType.charAt(0).toUpperCase() + modalType.slice(1) : 'Appointments'}
            </Text>
            {/* Display a loading spinner if modal is loading */}
            {modalLoading ? (
              <ActivityIndicator size="large" color="#009688" style={styles.modalLoader} />
            ) : (
              <>
                {appointments.length === 0 ? (
                  <Text style={styles.noAppointmentsText}>No Appointments</Text> // Show this message if there are no appointments
                ) : (
                  <FlatList
                    data={appointments}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.appointmentItem}>
                        <Text style={styles.appointmentText}>
                          <Text style={styles.appointmentType}>{item.type} </Text>
                          on {formatAppointmentDate(item.appointment_time)}
                          {"\n"}
                          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                            Patient: {item.first_name} {item.last_name}
                          </Text>
                        </Text>
                      </View>
                    )}
                    style={styles.scrollableList}  // Apply scroll styling
                  />
                )}
              </>
            )}
            {/* Close button at the bottom */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  widget: {
    width: widgetSize,
    height: widgetSize,
    borderRadius: 10,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Set background to white
    position: 'relative',
  },
  pending: {
    // Shadow effect for pending widget
    shadowColor: '#f5aa5b',  // Shadow color matches the text color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // Android shadow
  },
  confirmed: {
    // Shadow effect for confirmed widget
    shadowColor: '#009688',  // Shadow color matches the text color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // Android shadow
  },
  noShow: {
    // Shadow effect for no-show widget
    shadowColor: '#ff5733',  // Shadow color matches the text color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // Android shadow
  },
  completed: {
    // Shadow effect for completed widget
    shadowColor: '#6ba3be',  // Shadow color matches the text color
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 9,
    elevation: 5, // Android shadow
  },
  labelPending: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f5aa5b', // Pending label color
  },
  labelConfirmed: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#009688', // Confirmed label color
  },
  labelNoShow: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ff5733', // No Show label color
  },
  labelCompleted: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6ba3be', // Completed label color
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000', // Label text color is black
  },
  topLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  count: {
    fontSize: 35,
    color: '#000', // Text color of count is black (the former background)
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  simpleModalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '85%',
    elevation: 5,
    maxHeight: '80%', // Limit height
    flexDirection: 'column', // Stack content vertically
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796B', // Modal title color
    marginBottom: 15,
  },
  appointmentItem: {
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    elevation: 3,
  },
  appointmentText: {
    fontSize: 16,
    color: '#333', // Text color for appointments
  },
  appointmentType: {
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#009688', // Button background
    padding: 10,
    borderRadius: 5,
    marginTop: 'auto', // Push button to bottom
  },
  closeButtonText: {
    color: '#FFF', // White text on button
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoader: {
    marginTop: 20,
  },
  scrollableList: {
    maxHeight: '80%', // Make the list scrollable
  },
  noAppointmentsText: {
    fontSize: 18,
    color: '#9e9d9d',
    textAlign: 'center',
    padding: 18,
    marginBottom: 10,
  },
});
