import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';  // Assuming supabase.js is configured and exported from here

export default function PatientReview() {
  const [reviews, setReviews] = useState([]);  // State to store the fetched reviews
  const [loading, setLoading] = useState(true);  // State for loading indicator
  const [error, setError] = useState(null);  // State for error handling

  // Function to fetch reviews from Supabase
  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews') // The reviews table in Supabase
        .select('id, rating, comment, first_name, last_name, email') // Select specific fields
        .order('created_at', { ascending: false }) // Sort by created_at, most recent first
        .limit(5); // Fetch the 5 most recent reviews

      if (error) throw error;

      setReviews(data);  // Set the fetched data to state
    } catch (error) {
      setError(error.message);  // Set error if there's an issue
    } finally {
      setLoading(false);  // Stop loading once data is fetched
    }
  };

  // Fetch reviews when the component mounts
  useEffect(() => {
    fetchReviews();
  }, []);

  // Render each review
  const renderReview = ({ item }) => (
    <View style={styles.reviewContainer}>
      <Text style={styles.reviewerInfo}>
        {/* Display first name followed by last name */}
        <Text style={styles.reviewerName}>{item.first_name} {item.last_name}</Text>
        {"  "} | <Text style={styles.reviewerEmail}>{item.email}</Text>
      </Text>
      <Text style={styles.ratingText}>Rating: {item.rating}⭐</Text>
      <Text style={styles.reviewText}>Comment: {item.comment}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recent Patient Reviews</Text>

      {/* Handle loading and error states */}
      {loading ? (
        <Text style={styles.loadingText}>Loading reviews...</Text>
      ) : error ? (
        <Text style={styles.errorText}>Error: {error}</Text>
      ) : (
        // Display the reviews using FlatList without nesting it inside a ScrollView
        <FlatList
          data={reviews}
          renderItem={renderReview}
          keyExtractor={(item) => item.id.toString()}  // Ensure the key is unique
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',  // Light background color to match app theme
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#009688',  // Teal color for the header
    textAlign: 'center',
  },
  reviewContainer: {
    backgroundColor: '#fff',
    padding: 20,  // Increased padding for better spacing
    marginBottom: 15,  // Spacing between reviews
    borderRadius: 10,  // Rounded corners
    shadowColor: '#009688',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,  // Elevated shadow effect
  },
  reviewerInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,  // Spacing between name/email and rating
  },
  reviewerName: {
    fontWeight: 'bold',
    color: '#009688',  // Name in teal color
  },
  reviewerEmail: {
    color: '#888',  // Email in lighter gray
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#009688',  // Rating in teal color
    marginBottom: 8,  // Margin below rating text
  },
  reviewText: {
    fontSize: 16,
    color: '#333',  // Darker text color for comment
    marginBottom: 5,  // Space between comment and other content
  },
  loadingText: {
    fontSize: 18,
    color: '#888',  // Loading text in gray
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});
