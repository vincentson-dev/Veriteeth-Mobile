import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../lib/supabase';

const screenWidth = Dimensions.get('window').width;

export default function MonthlyPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPatientIndex, setCurrentPatientIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchPatientsForMonth = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      const { data, error } = await supabase
        .from('appointments')
        .select('first_name, last_name, type') // Include the type of appointment
        .gte('appointment_time', startOfMonth.toISOString())
        .lt('appointment_time', endOfMonth.toISOString());

      if (error) throw error;

      const uniquePatients = Array.from(
        new Map(
          data.map((item) => [`${item.first_name} ${item.last_name}`, item])
        ).values()
      );

      setPatients(uniquePatients);
    } catch (error) {
      console.error('Error fetching patients:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientsForMonth();
  }, []);

  useEffect(() => {
    if (patients.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPatientIndex((prevIndex) => (prevIndex + 1) % patients.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [patients]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patients (Most Recent)</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#009688" />
      ) : (
        <View>
          {patients.length > 0 && (
            <TouchableOpacity
              style={styles.patientRow}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.patientName}>
                {patients[currentPatientIndex].first_name}{' '}
                {patients[currentPatientIndex].last_name}
              </Text>
              <Text style={styles.appointmentType}>
                {patients[currentPatientIndex].type}
              </Text>
            </TouchableOpacity>
          )}

          <Modal
            visible={modalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>All Patients for the Month</Text>
              <FlatList
                data={patients}
                keyExtractor={(item, index) => `${item.first_name}-${index}`}
                renderItem={({ item }) => (
                  <View style={styles.patientRowModal}>
                    <Text style={styles.patientInfoModal}>
                      {item.first_name} {item.last_name}
                    </Text>
                    <Text style={styles.patientTypeModal}>{item.type}</Text>
                  </View>
                )}
              />
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 5,
    marginVertical: 10,
    width: 370,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00796B',
    marginBottom: 12,
    textAlign: 'flex-start',
  },
  patientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
  },
  patientName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  appointmentType: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00796B',
    textAlign: 'right',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#e8ecf4',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color:  '#009688',
    marginBottom: 20,
    textAlign: 'center',
  },
  patientRowModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  patientInfoModal: {
    fontSize: 16,
    fontWeight: '600',
    color:  '#009688',
    flex: 1,
  },
  patientTypeModal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00796B',
    textAlign: 'right',
    flex: 1,
  },
  closeModalButton: {
    backgroundColor:'#009688',
    padding: 15,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
    width:370,
    
  },
  closeModalText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    textAlign:'center',
  },
});
