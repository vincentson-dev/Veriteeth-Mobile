import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import WelcomeUser from './WelcomeUser';

export default function AdminHome() {
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationViewed, setNotificationViewed] = useState(false);
  const [userData, setUserData] = useState({ first_name: '', last_name: '' });
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState([]);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error('Error fetching session:', error);
        return;
      }
      const { first_name, last_name } = session.user.user_metadata;
      setUserData({ first_name, last_name });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Fetch notifications for pending appointments and new reviews
  const fetchNotifications = async () => {
    try {
      // Fetch pending appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, type, appointment_time, created_at, user_email')
        .eq('pending_appointments', true); // Updated field name for clarity

      if (appointmentsError) throw appointmentsError;

      // Fetch new reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, first_name, comment, rating, created_at')
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Combine both into one notification list
      const combinedNotifications = [
        ...appointments.map((appointment) => ({
          id: `appointment-${appointment.id}`,
          type: 'appointment',
          message: `Pending appointment for ${userData.first_name} ${userData.last_name} on ${new Date(
            appointment.appointment_time || appointment.created_at
          ).toLocaleString()} (${appointment.type})`,
          details: `User Email: ${appointment.user_email}`,
        })),
        ...reviews.map((review) => ({
          id: `review-${review.id}`,
          type: 'review',
          message: `New review from ${review.first_name}: ${review.comment} (${review.rating}⭐)`,
        })),
      ];

      // Filter out dismissed notifications
      const filteredNotifications = combinedNotifications.filter(
        (notification) => !dismissedNotificationIds.includes(notification.id)
      );

      setNotifications(filteredNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchUserData(); // Fetch user data when component loads
  }, []);

  useEffect(() => {
    if (userData.first_name && userData.last_name) {
      fetchNotifications(); // Fetch notifications only after user data is available
    }
  }, [userData, dismissedNotificationIds]);

  const handleNotificationIconPress = () => {
    setModalVisible(true);
    setNotificationViewed(true); // Mark notifications as viewed
  };

  // Clear all notifications
  const clearNotifications = () => {
    setDismissedNotificationIds((prev) => [
      ...prev,
      ...notifications.map((notification) => notification.id),
    ]);
    setNotifications([]); // Clear the current notifications list
    setNotificationViewed(true); // Ensure badge resets
  };

  const NotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationText}>{item.message}</Text>
      {item.details && <Text style={styles.notificationDetails}>{item.details}</Text>}
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={styles.container}>
        {/* Welcome User */}
        <View style={styles.headerContainer}>
          <WelcomeUser />
          <TouchableOpacity onPress={handleNotificationIconPress}>
            <View style={styles.notificationIconContainer}>
              <MaterialIcons name="notifications" size={40} color="#009688" />
              {/* Show badge if there are unseen notifications */}
              {!notificationViewed && notifications.length > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{notifications.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Admin Home</Text>
      </View>

      {/* Notifications Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notifications</Text>
            {notifications.length > 0 ? (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
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
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    paddingTop: StatusBar.currentHeight || 16,
    backgroundColor: '#e8ecf4',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
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

  notificationDetails: {
    fontSize: 14,
    color: '#555',
  },
});
