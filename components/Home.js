import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';

import WelcomeUser from './WelcomeUser';
import ImageSlider from './ImageSlider';
import ServicesTab from './ServicesTab';
import HomeAppointmentCard from './HomeAppointmentCard';
import ReviewInput from './ReviewInput';
import PatientReview from './PatientReview';

export default function Home() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationViewed, setNotificationViewed] = useState(false); // New state to track if notifications were viewed

  // Fetch confirmed or cancelled appointments with the type
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, type, appointment_time, created_at, confirmed_appointments, cancelled_appointments')
        .or('confirmed_appointments.eq.true,cancelled_appointments.eq.true');
      if (error) throw error;
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const NotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationText}>
        Your {item.type || 'appointment'} scheduled for{' '}
        {new Date(item.appointment_time || item.created_at).toLocaleString()} has been{' '}
        {item.confirmed_appointments ? 'confirmed' : 'cancelled'}.
      </Text>
    </View>
  );

  const handleNotificationIconPress = () => {
    setModalVisible(true);
    setNotificationViewed(true); // Mark notifications as viewed when modal opens
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]); // Reset notifications
    setNotificationViewed(true); // Reset badge visibility
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <WelcomeUser />
          <View>
            <TouchableOpacity onPress={handleNotificationIconPress}>
              <View style={styles.notificationIconContainer}>
                <MaterialIcons name="notifications" size={40} color="#009688" />
                {/* If notifications are present and the user hasn't viewed them, show the badge */}
                {!notificationViewed && notifications.length > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{notifications.length}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.componentContainer}>
          <ServicesTab />
        </View>
        <View style={styles.componentContainer}>
          <ImageSlider />
        </View>
        <View style={styles.componentContainer}>
          <HomeAppointmentCard />
        </View>
        <View style={styles.componentContainer}>
          <PatientReview />
        </View>
        <View style={styles.componentContainer}>
          <ReviewInput />
        </View>
      </ScrollView>

      {/* Modal for notifications */}
      <Modal
        visible={modalVisible}
        animationType="fade" // Fade transition
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notifications</Text>
            {notifications.length > 0 ? (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <NotificationItem item={item} />}
              />
            ) : (
              <Text style={styles.noNotificationsText}>No notifications at the moment.</Text>
            )}
            <View style={styles.buttonContainer}>
              {/* Clear Notifications Button */}
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearNotifications}
              >
                <Text style={styles.clearButtonText}>Clear Notifications</Text>
              </TouchableOpacity>
              {/* Close Modal Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 16,
    paddingTop: StatusBar.currentHeight || 16,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  componentContainer: {
    marginBottom: 10,
  },
  notificationIconContainer: {
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: -5,
    backgroundColor: '#FF6347',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: '100%',
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
  },
  noNotificationsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  clearButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
