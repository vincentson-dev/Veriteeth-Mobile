import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Text as RNText, StyleSheet } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { supabase } from '../lib/supabase'; // Adjust the path to your Supabase config file

export default function ReviewPage() {
  const [userData, setUserData] = useState({ first_name: '', email: '' }); // To store user data
  const [rating, setRating] = useState(0); // To store the star rating
  const [comment, setComment] = useState(''); // To store the review comment
  const [loading, setLoading] = useState(true); // Loading state for session data

  // Fetch user data from the session when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          console.error('Error fetching session:', error);
          setLoading(false);
          return;
        }

        const { first_name, email } = session.user.user_metadata; // Assuming raw_user_meta_data is stored here
        setUserData({ first_name, email });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Function to handle review submission
  const submitReview = async () => {
    if (rating === 0 || comment.trim() === '') {
      alert('Please provide a rating and a comment!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reviews')  // Adjust table name to your setup
        .insert([
          {
            rating,
            comment,
            email: userData.email,
            first_name: userData.first_name,
          },
        ]);

      if (error) throw error;

      alert('Review submitted successfully!');
      setRating(0);  // Reset rating
      setComment('');  // Reset comment
    } catch (error) {
      alert('Error submitting review: ' + error.message);
    }
  };

  // Display loading screen if fetching session data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leave a Review</Text>

      {/* Display User's Name and Email */}
      <Text style={styles.userInfo}>Logged in as: {userData.first_name}</Text>
      <Text style={styles.userInfo}>Email: {userData.email}</Text>

      {/* Star Rating */}
      <AirbnbRating
        count={5}
        defaultRating={rating}
        onFinishRating={(value) => setRating(value)}
        size={30}
        showRating={false}  // Hide text below stars
      />

      {/* Review Text Input */}
      <TextInput
        style={styles.textInput}
        placeholder="Write your review here..."
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.buttonContainer} onPress={submitReview}>
        <RNText style={styles.buttonText}>Submit Review</RNText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 28,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    shadowColor: '#009688',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
    alignItems: 'center',
    marginVertical: 10,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#009688',
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  textInput: {
    marginTop: 15,
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    textAlignVertical: 'top',
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
    backgroundColor: '#009688',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
});
