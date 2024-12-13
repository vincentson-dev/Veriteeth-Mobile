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
  const [notificationViewed, setNotificationViewed] = useState(false); // Tracks badge visibility
  const [showAllNotifications, setShowAllNotifications] = useState(false); // To toggle between 4 or all notifications

  // Fetch notifications including "No Show" and "Completed"
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, type, appointment_time, created_at, confirmed_appointments, cancelled_appointments, no_show, finished_appointments')
        .or('confirmed_appointments.eq.true,cancelled_appointments.eq.true,no_show.eq.true,finished_appointments.eq.true');

      if (error) throw error;

      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const NotificationItem = ({ item }) => {
    let statusMessage = '';

    if (item.confirmed_appointments) {
      statusMessage = 'confirmed';
    } else if (item.cancelled_appointments) {
      statusMessage = 'cancelled';
    } else if (item.no_show) {
      statusMessage = 'marked as No Show';
    } else if (item.finished_appointments) {
      statusMessage = 'marked as Completed';
    }

    return (
      <View style={styles.notificationItem}>
        <Text style={styles.notificationText}>
          Your {item.type || 'appointment'} scheduled for{' '}
          {new Date(item.appointment_time || item.created_at).toLocaleString()} has been {statusMessage}.
        </Text>
      </View>
    );
  };

  const handleNotificationIconPress = () => {
    setModalVisible(true);
    setNotificationViewed(true); // Reset badge visibility when modal opens
  };

  // Notifications to show based on the "showAllNotifications" state
  const visibleNotifications = showAllNotifications ? notifications : notifications.slice(0, 4);

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
                {/* Show the badge if there are notifications and they haven't been viewed */}
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
            {visibleNotifications.length > 0 ? (
              <FlatList
                data={visibleNotifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <NotificationItem item={item} />}
              />
            ) : (
              <Text style={styles.noNotificationsText}>No notifications at the moment.</Text>
            )}
            {/* Show the "View Previous Notifications" button only if there are more than 4 notifications */}
            {notifications.length > 4 && !showAllNotifications && (
              <TouchableOpacity onPress={() => setShowAllNotifications(true)}>
                <Text style={styles.previousNotificationsText}>View Previous Notifications</Text>
              </TouchableOpacity>
            )}
            {/* Show the "View Less" button if all notifications are being shown */}
            {showAllNotifications && (
              <TouchableOpacity onPress={() => setShowAllNotifications(false)}>
                <Text style={styles.previousNotificationsText}>View Less</Text>
              </TouchableOpacity>
            )}
            {/* Close Modal Button */}
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
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 16,
    paddingTop: StatusBar.currentHeight || 16,
    backgroundColor: '#e8ecf4',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  componentContainer: {
    marginBottom: 5,
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
  previousNotificationsText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginVertical: 20,
    textDecorationLine: 'underline',
  },
  closeButton: {
    backgroundColor: '#009688',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
