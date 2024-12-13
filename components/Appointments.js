import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, ActivityIndicator, Modal, FlatList,StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../lib/supabase';

export default function AppointmentSetting() {
  const [userData, setUserData] = useState({ first_name: '', last_name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState('');
  const [time, setTime] = useState(new Date().setHours(9, 0, 0));
  const [appointmentType, setAppointmentType] = useState('');
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Fetch user data when the component mounts
  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          console.error('Error fetching session:', error);
          Alert.alert('Error', 'Failed to fetch user session.');
          return;
        }
        const { first_name, last_name, email } = session.user.user_metadata;
        setUserData({ first_name, last_name, email });
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load user data.');
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, []);

  // Handle selecting a date on the calendar
  const handleDateSelect = (day) => {
    const selectedDate = new Date(day.timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      Alert.alert('Invalid Date', 'You cannot select a past date.');
      return;
    }

    setDate(selectedDate);
    setFormattedDate(day.dateString);
  };

  // Handle selecting a time for the appointment
  const handleTimeSelect = (selectedTime) => {
    const newTime = new Date(time);
    newTime.setHours(selectedTime, 0, 0, 0);
    setTime(newTime);
    setShowTimePicker(false);
  };

  // Handle selecting an appointment type
  const handleTypeSelect = (type) => {
    setAppointmentType(type);
    setShowTypeSelection(false);
  };

  // Reset form fields after successful appointment
  const resetFields = () => {
    setDate(new Date());
    setFormattedDate('');
    setAppointmentType('');
  };

  // Check for conflicts with existing appointments on the selected date
  const checkForConflicts = async () => {
    try {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('confirmed_appointments', true)
        .gte('appointment_time', selectedDate.toISOString())
        .lt('appointment_time', new Date(selectedDate.setDate(selectedDate.getDate() + 1)).toISOString());

      if (error) throw error;
      return data.length > 0;
    } catch (error) {
      console.error('Error checking for conflicts:', error.message);
      Alert.alert('Error', 'Failed to check for conflicts. Please try again.');
      return false;
    }
  };

  // Validate the selected appointment details
  const validateAppointmentDetails = () => {
    const selectedDay = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      Alert.alert('Invalid Date', 'Appointments cannot be set for past dates.');
      return false;
    }

    if (selectedDay === 0 || selectedDay === 6) {
      Alert.alert('Invalid Date', 'Please select a weekday (Monday to Friday).');
      return false;
    }

    if (!appointmentType) {
      Alert.alert('Invalid Type', 'Please select an appointment type.');
      return false;
    }

    return true;
  };

  // Submit the appointment to the database
  const submitAppointment = async () => {
    const formattedTime = new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const appointmentMessage = `${userData.first_name} ${userData.last_name} has set an appointment for ${formattedDate} at ${formattedTime}.`;

    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          message: appointmentMessage,
          type: appointmentType,
          appointment_time: new Date(date.setHours(time.getHours(), time.getMinutes())).toISOString(),
          first_name: userData.first_name,  // Insert first_name
          last_name: userData.last_name,    // Insert last_name
          user_email: userData.email,
          pending_appointments: true,        // Indicate pending status
        }]);

      if (error) throw error;
      Alert.alert('Appointment Pending', `${appointmentMessage}\nType: ${appointmentType}`);
      resetFields();
    } catch (error) {
      console.error('Error inserting appointment:', error.message);
      Alert.alert('Error', 'Failed to set appointment. Please try again.');
    }
  };

  // Validate and submit the appointment
  const validateAndSubmitAppointment = async () => {
    if (!validateAppointmentDetails()) return;

    const hasConflict = await checkForConflicts();
    if (hasConflict) {
      Alert.alert('Time Conflict', 'You already have an appointment on this day. Please choose another date.');
      return;
    }

    await submitAppointment();
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#40E0D0" />
      </View>
    );
  }

  // Available times for appointments
  const availableTimes = [];
  for (let hour = 9; hour <= 16; hour++) {
    availableTimes.push(hour);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set an Appointment</Text>

      <Text style={styles.label}>Select Date:</Text>
      <Calendar
        current={date.toISOString().split('T')[0]}
        markedDates={{
          [formattedDate]: { selected: true, selectedColor: '#009688', selectedTextColor: '#fff' },
        }}
        onDayPress={handleDateSelect}
        monthFormat={'MMMM'}
        style={styles.calendar}
      />

      <View style={styles.row}>
        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timeButton}>
          <Text style={styles.buttonText}>
            {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Select Time'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowTypeSelection(true)} style={styles.typeButton}>
          <Text style={styles.buttonText}>{appointmentType || 'Appointment Type'}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Time Picker */}
      <Modal visible={showTimePicker} animationType="fade" transparent={true} onRequestClose={() => setShowTimePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Appointment Time</Text>
            <FlatList
              data={availableTimes}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleTimeSelect(item)} style={styles.modalOption}>
                  <Text style={styles.modalOptionText}>{`${item}:00`}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowTimePicker(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Appointment Type Selection */}
      <Modal visible={showTypeSelection} animationType="fade" transparent={true} onRequestClose={() => setShowTypeSelection(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Appointment Type</Text>
            {['Consultation', 'Follow-up', 'Check-up'].map((type) => (
              <TouchableOpacity key={type} onPress={() => handleTypeSelect(type)} style={styles.modalOption}>
                <Text style={styles.modalOptionText}>{type}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowTypeSelection(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity onPress={validateAndSubmitAppointment} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit Appointment</Text>
      </TouchableOpacity>
    </View>
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
    marginTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#009688',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  calendar: {
    marginBottom: 20,
    width: 370,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 15,
  },
  timeButton: {
    flex: 1,
    backgroundColor: '#009688',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#009688',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  submitButton: {
    
    marginTop: 20,
    backgroundColor: '#009688',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign:'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#00796B',
  },
  closeButton: {
    marginTop: 15,
    alignSelf: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FF6347',
    fontWeight: 'bold',
  },
});
