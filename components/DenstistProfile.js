import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function DentistProfile({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ first_name: '', last_name: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

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
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
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

      <TouchableOpacity style={styles.settingsToggle} onPress={() => setShowSettings(!showSettings)}>
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

      {/* Sign-out button */}
      <View style={styles.signOutContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowSignOutModal(true)}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Sign-out confirmation modal */}
      <Modal
        visible={showSignOutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSignOutModal(false)}
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
                onPress={() => setShowSignOutModal(false)}
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
    marginTop: 30,
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
  },
  resetButton: {
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutContainer: {
    position: 'absolute',  // Make the sign-out button fixed at the bottom
    left: 0,
    right: 0,
    bottom: 80,  // 80px from the bottom
    paddingHorizontal: 20,
    paddingVertical: 10,
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
});
