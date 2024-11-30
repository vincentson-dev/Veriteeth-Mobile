import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, PanResponder } from 'react-native';

// Define the path to your images
const images = [
  require('../assets/images/clinic1.jpeg'),
  require('../assets/images/clinic2.jpeg'),
  require('../assets/images/clinic3.jpeg'),
  require('../assets/images/clinic4.jpg'),
  require('../assets/images/clinic5.jpeg'), // Replace with your image paths
];

const ImageSlider = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [opacity] = useState(new Animated.Value(1));
  const intervalRef = useRef(null); // Store reference to the interval

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 30; // threshold for swipe
      },
      onPanResponderEnd: (_, gestureState) => {
        if (gestureState.dx > 30) {
          // Swiped right (previous image)
          slideToPreviousImage();
        } else if (gestureState.dx < -30) {
          // Swiped left (next image)
          slideToNextImage();
        }
      },
    })
  ).current;

  const slideToNextImage = () => {
    // Fade out the current image
    Animated.timing(opacity, {
      toValue: 0, // Fade out
      duration: 300, // Short duration for quick fade
      useNativeDriver: true,
    }).start(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length); // Loop back to the first image
      opacity.setValue(1); // Reset opacity for the next transition

      // Fade in the next image
      Animated.timing(opacity, {
        toValue: 1, // Fade in
        duration: 300, // Short duration for quick fade
        useNativeDriver: true,
      }).start();
    });
  };

  const slideToPreviousImage = () => {
    // Fade out the current image
    Animated.timing(opacity, {
      toValue: 0, // Fade out
      duration: 300, // Short duration for quick fade
      useNativeDriver: true,
    }).start(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex - 1 + images.length) % images.length // Loop back to the last image
      );
      opacity.setValue(1); // Reset opacity for the next transition

      // Fade in the previous image
      Animated.timing(opacity, {
        toValue: 1, // Fade in
        duration: 300, // Short duration for quick fade
        useNativeDriver: true,
      }).start();
    });
  };

  // Auto swipe functionality
  useEffect(() => {
    // Set an interval to automatically swipe every 10 seconds
    intervalRef.current = setInterval(() => {
      slideToNextImage();
    }, 10000); // 10000 milliseconds = 10 seconds

    // Clear the interval on component unmount
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View style={[styles.imageContainer, { opacity }]}>
        <Image source={images[currentImageIndex]} style={styles.image} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300, // Set height to match your previous design
    borderRadius: 15, // Round corners for a modern look
    overflow: 'hidden', // Hide overflow for rounded corners
    shadowColor: '#000', // Shadow for elevation effect
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Elevation for Android shadow
    backgroundColor: '#ffffff', // Set background color to white for contrast
  },
  imageContainer: {
    width: '100%', // Full width for the container
    height: '100%', // Full height to fill the container
    position: 'absolute', // Position absolute for smooth sliding
  },
  image: {
    width: '100%', // Full width for the image
    height: '100%', // Full height to fill the container
    resizeMode: 'cover', // Maintain aspect ratio
  },
});

export default ImageSlider;
