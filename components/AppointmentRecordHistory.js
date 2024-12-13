import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

const screenWidth = Dimensions.get('window').width;
const widgetSize = (screenWidth - 48) / 4;

export default function AdminWidget() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState({ start: false, end: false });
  const [fetchLoading, setFetchLoading] = useState(false);

  const fetchAppointments = async () => {
    setFetchLoading(true);
    try {
      let query = supabase.from('appointments').select('*').order('appointment_time', { ascending: false });

      if (startDate && endDate) {
        query = query.gte('appointment_time', startDate.toISOString()).lte('appointment_time', endDate.toISOString());
      }

      const { data, error } = await query.limit(10); // Default limit if no range is selected
      if (error) throw error;

      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error.message);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate, type) => {
    if (type === 'start') {
      setShowDatePicker({ ...showDatePicker, start: false });
      setStartDate(selectedDate || startDate);
    } else {
      setShowDatePicker({ ...showDatePicker, end: false });
      setEndDate(selectedDate || endDate);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [startDate, endDate]);

  const formatAppointmentDate = (appointmentTime) => {
    const date = new Date(appointmentTime);

    // Define month names for formatting
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Define weekdays for formatting
    const weekdays = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];

    // Get the day of the week
    const dayOfWeek = weekdays[date.getDay()];

    // Get the month, day, and year
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    // Format the time
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes; // Add leading zero if minutes < 10

    return (
      <Text>
        <Text style={{ fontWeight: 'bold' }}>{month} {day}, {year} </Text>
        <Text style={{ fontWeight: 'bold' }}>{dayOfWeek}, </Text>
        <Text style={{ fontWeight: 'bold' }}>at {formattedHours}:{formattedMinutes}{ampm}</Text>
      </Text>
    );
  };

  const getAppointmentStatus = (noShow, finishedAppointments) => {
    if (noShow) return 'No Show';
    if (finishedAppointments) return 'Completed';
    return null;
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setStartDate(null); // Reset start date
    setEndDate(null); // Reset end date
    setShowDatePicker({ start: false, end: false }); // Close any open date pickers
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.fetchButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.fetchButtonText}>View Appointments</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Appointments</Text>

            {/* Date Pickers */}
            <View style={styles.datePickerContainer}>
              <TouchableOpacity onPress={() => setShowDatePicker({ ...showDatePicker, start: true })}>
                <Text style={[styles.dateText, startDate ? styles.selectedDateText : styles.defaultDateText]}>
                  Start Date: {startDate ? startDate.toLocaleDateString() : 'Select'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDatePicker({ ...showDatePicker, end: true })}>
                <Text style={[styles.dateText, endDate ? styles.selectedDateText : styles.defaultDateText]}>
                  End Date: {endDate ? endDate.toLocaleDateString() : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker.start && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={(e, date) => handleDateChange(e, date, 'start')}
              />
            )}
            {showDatePicker.end && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={(e, date) => handleDateChange(e, date, 'end')}
              />
            )}

            {/* Appointments List */}
            {fetchLoading ? (
              <ActivityIndicator size="large" color="#009688" />
            ) : (
              <FlatList
                data={appointments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.appointmentItem}>
                    <Text style={styles.appointmentType}>
                      Appointment Type: {item.type || 'N/A'}
                    </Text>
                    <Text style={styles.appointmentText}>
                      Appointment on {formatAppointmentDate(item.appointment_time)}{"\n"}
                      <Text style={{ fontWeight: 'bold' }}>Patient: {item.first_name} {item.last_name}</Text>
                    </Text>
                    {/* Highlighted Status Text */}
                    {getAppointmentStatus(item.no_show, item.finished_appointments) && (
                      <Text 
                        style={[
                          styles.statusText,
                          item.no_show ? styles.noShowStatus : item.finished_appointments ? styles.completedStatus : null
                        ]}
                      >
                        Status: {getAppointmentStatus(item.no_show, item.finished_appointments)}
                      </Text>
                    )}
                  </View>
                )}
                style={styles.scrollableList}
              />
            )}

            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
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
    padding: 15,
  },
  fetchButton: {
    backgroundColor: '#009688',
    paddingVertical: 12,
    width:370,
    height:60,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 5, // Subtle shadow for depth
    justifyContent: 'center', // Ensure the text is centered
  },
  fetchButtonText: {
    color: '#fff',
    fontSize: 22, // Increased font size
    fontWeight: '600', // Medium weight for emphasis
    letterSpacing: 0.5, // Slightly increased letter spacing for clarity
    textAlign: 'center', // Ensures the text is centered
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16, // Larger rounded corners
    width: '90%',
    maxHeight: '80%',
    elevation: 15, // Increased elevation for more depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15, // Stronger shadow for added depth
    transform: [{ scaleX: 1.05 }, { scaleY: 1.05 }], // Slight scaling for emphasis
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#00796B',
    marginBottom: 12,
    textAlign: 'center', // Centered title for better presentation
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  defaultDateText: {
    color: '#999', // Lighter color when not selected
  },
  selectedDateText: {
    color: '#00796B', // Accent color when selected
    fontWeight: '600',
  },
  appointmentItem: {
    padding: 18,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    position: 'relative',
    elevation: 3,
  },
  appointmentType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00796B',
    marginBottom: 8,
  },
  appointmentText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  statusText: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  noShowStatus: {
    color: '#e74c3c',
  },
  completedStatus: {
    color: '#2ecc71',
  },
  closeButton: {
    backgroundColor: '#009688',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 18,
    alignItems: 'center',
    elevation: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scrollableList: {
    maxHeight: 350,
  },
});
