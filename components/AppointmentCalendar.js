import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Calendar } from 'react-native-calendars';

export default function AppointmentCalendar() {
  const [markedDates, setMarkedDates] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animation] = useState(new Animated.Value(0));

  // Fetch appointments and mark dates
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, appointment_time, type, first_name, last_name, no_show, finished_appointments');

      if (error) throw error;

      const datesWithAppointments = {};
      data.forEach(({ appointment_time }) => {
        const date = appointment_time.split('T')[0];
        datesWithAppointments[date] = {
          marked: true,
          dotColor: '#008080',
          color: '#d3f4f3',
        };
      });

      setMarkedDates(datesWithAppointments);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const filteredAppointments = appointments.filter((appointment) =>
    appointment.appointment_time.startsWith(selectedDate)
  );

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedDate(null);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#009688" />
      ) : (
        <Calendar
          markedDates={markedDates}
          theme={{
            selectedDayBackgroundColor: '#009688',
            todayTextColor: '#009688',
            arrowColor: '#009688',
            dotColor: '#008080',
          }}
          onDayPress={handleDayPress}
          style={styles.calendar}
          monthFormat="MMMM" // <-- This line will show only the month name
        />
      )}

      <Modal visible={modalVisible} transparent={true} animationType="none">
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: animation,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.modalTitle}>
              Appointments for {new Date(selectedDate).toLocaleDateString()}
            </Text>

            {filteredAppointments.length > 0 ? (
              <FlatList
                data={filteredAppointments}
                keyExtractor={(item) =>
                  item.id ? item.id.toString() : item.appointment_time
                }
                renderItem={({ item }) => (
                  <View style={styles.appointmentItem}>
                    <Text style={styles.appointmentType}>
                      Appointment Type: {item.type || 'N/A'}
                    </Text>
                    <Text style={styles.appointmentText}>
                      Appointment at{' '}
                      {new Date(item.appointment_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {"\n"}
                      <Text style={{ fontWeight: 'bold' }}>
                        Patient: {item.first_name} {item.last_name}
                      </Text>
                    </Text>
                    {item.no_show || item.finished_appointments ? (
                      <Text
                        style={[
                          styles.statusText,
                          item.no_show
                            ? styles.noShowStatus
                            : styles.completedStatus,
                        ]}
                      >
                        Status: {item.no_show ? 'No Show' : 'Completed'}
                      </Text>
                    ) : null}
                  </View>
                )}
                style={styles.scrollableList}
              />
            ) : (
              <Text style={styles.noAppointmentsText}>
                No Appointments for Today
              </Text>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  calendar: {
    width: '370',
    borderRadius: 5,
    alignSelf: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 15,
    textAlign: 'center',
  },
  appointmentItem: {
    padding: 18,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
    position: 'relative',
    borderLeftWidth: 5,
    borderLeftColor: '#009688',
  },
  appointmentType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 8,
  },
  appointmentText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  noAppointmentsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom:10,
  },
  statusText: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    fontSize: 14,
    fontWeight: 'bold',
  },
  noShowStatus: {
    color: 'red',
  },
  completedStatus: {
    color: 'green',
  },
  closeButton: {
    backgroundColor: '#009688',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollableList: {
    maxHeight: 300,
  },
});
