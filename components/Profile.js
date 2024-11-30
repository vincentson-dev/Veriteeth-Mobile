import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function Profile({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ first_name: '', last_name: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          console.error('Error fetching session:', error);
          setLoading(false);
          return;
        }

        const { first_name, last_name, email } = session.user.user_metadata;
        setUserData({ first_name, last_name, email });
        fetchConfirmedAppointments(email);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchConfirmedAppointments = async (email) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, confirmed_appointments, appointment_time, type')
        .eq('confirmed_appointments', true)
        .eq('user_email', email);

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch appointments.');
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSignOut = async () => {
    setSignOutModalVisible(false); // Close modal
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Error', error.message);
      return;
    }
    Alert.alert('Signed Out', 'You have been signed out successfully.');
    navigation.navigate('LogIn');
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert('Invalid Input', 'Please enter a new password.');
      return;
    }

    setIsUpdating(true);
    const { error } = await supabase.auth.update({ password: newPassword });

    if (error) {
      Alert.alert('Password Reset Error', error.message);
    } else {
      Alert.alert('Password Reset Success', 'Your password has been updated.');
      setNewPassword('');
    }
    setIsUpdating(false);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const formatAppointmentDate = (appointmentTime) => {
    const date = new Date(appointmentTime);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = daysOfWeek[date.getDay()];
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `${day}, ${formattedDate} at ${formattedTime}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00796B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        {userData.first_name} {userData.last_name}
      </Text>
      <Text style={styles.emailText}>{userData.email}</Text>

      <TouchableOpacity style={styles.settingsToggle} onPress={toggleSettings}>
        <Text style={styles.settingsToggleText}>
          {showSettings ? 'Hide Account Settings' : 'Show Account Settings'}
        </Text>
      </TouchableOpacity>

      {showSettings && (
        <View style={styles.settingsContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleResetPassword}
            disabled={isUpdating}
          >
            <Text style={styles.buttonText}>
              {isUpdating ? 'Updating...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Confirmed Appointments</Text>
      {appointments.length > 0 ? (
        <FlatList
          data={appointments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedAppointment(item);
                setModalVisible(true);
              }}
            >
              <View style={styles.appointmentItem}>
                <Text style={styles.appointmentText}>
                  <Text style={styles.appointmentType}>{item.type} </Text>
                  confirmed for{' '}
                  <Text style={styles.appointmentDetails}>
                    {formatAppointmentDate(item.appointment_time)}
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noAppointmentsText}>No confirmed appointments</Text>
      )}

      {/* Sign Out Button */}
      <View style={styles.signOutContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setSignOutModalVisible(true)}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={signOutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSignOutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContainer}>
            <Text style={styles.confirmModalTitle}>Are you sure?</Text>
            <Text style={styles.confirmModalMessage}>
              Do you really want to sign out? You will need to log in again to access your account.
            </Text>
            <View style={styles.confirmModalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setSignOutModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleSignOut}
              >
                <Text style={styles.buttonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Appointment Modal */}
      {selectedAppointment && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.simpleModalContainer}>
              <Text style={styles.modalTitle}>{selectedAppointment.type}</Text>
              <Text style={styles.modalMessage}>
                Appointment Date and Time:
              </Text>
              <Text style={styles.modalMessage}>
                {formatAppointmentDate(selectedAppointment.appointment_time)}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#009688',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  settingsToggle: {
    marginBottom: 15,
  },
  settingsToggleText: {
    fontSize: 16,
    color: '#009688',
  },
  settingsContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderColor: '#CCC',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#009688',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom:70
  },
  resetButton: {
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  appointmentItem: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2,
  },
  appointmentText: {
    fontSize: 16,
    color: '#333',
  },
  appointmentType: {
    fontWeight: 'bold',
    color: '#009688',
  },
  appointmentDetails: {
    color: '#555',
  },
  noAppointmentsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  signOutContainer: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confirmModalContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '85%',
    elevation: 5,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#009688',
    marginBottom: 15,
  },
  confirmModalMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  confirmModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    backgroundColor: '#fc583f',
    flex: 1,
    marginRight: 10,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalConfirmButton: {
    backgroundColor: '#009688',
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  simpleModalContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#009688',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
