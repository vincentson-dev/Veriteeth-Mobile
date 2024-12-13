import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import WelcomeDentist from './WelcomeDentist';
import AppointmentCalendar from './AppointmentCalendar';
import AppointmentRecordHistory from './AppointmentRecordHistory';
import AdminWidget from './AdminWidget';
import MonthlyPatients from './MonthlyPatients';

const DentistHome = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <WelcomeDentist />
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <MaterialIcons name="notifications" size={40} color="#009688" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <AppointmentCalendar />
        <AppointmentRecordHistory />
        <AdminWidget />
        <MonthlyPatients />
      </View>

      {/* Modal for Notifications */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <Text style={styles.noNotificationsText}>No notifications at the moment.</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DentistHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 15,
    paddingTop: StatusBar.currentHeight || 12,
    backgroundColor: '#e8ecf4',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  noNotificationsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: '#009688',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
