import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase'; // Import supabase client

export default function SignUp() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '', // New state for confirm password
  });
  const [loading, setLoading] = useState(false);

  // Sign up function using Supabase
  async function signUpWithEmail() {
    setLoading(true);

    // Ensure that all form fields are filled out
    if (!form.name || !form.surname || !form.email || !form.password || !form.confirmPassword) {
      Alert.alert('Error', 'Please fill out all fields');
      setLoading(false);
      return;
    }

    // Ensure passwords match
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.name,
          last_name: form.surname,
        },
        // emailRedirectTo: 'https://your-app-url.com/welcome', // Set if email confirmation is enabled
      },
    });

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    // Insert user data into users table after successful sign-up
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          first_name: form.name,
          last_name: form.surname,
          email: form.email,
        },
      ]);

    if (insertError) {
      Alert.alert('Error', 'Failed to insert user data into the users table');
      setLoading(false);
      return;
    }

    // Successful sign-up flow
    if (data.session) {
      Alert.alert('Success', 'Signed up successfully!');
      navigation.navigate('LogIn');
    } else {
      Alert.alert('Success', 'Please check your email for confirmation!');
      navigation.navigate('LogIn'); // Navigate to LogIn while waiting for confirmation
    }

    setLoading(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4' }}>
      <KeyboardAwareScrollView style={styles.container}>
        <View style={styles.header}>
          <Image
            alt="App Logo"
            resizeMode="contain"
            style={styles.headerImg}
            source={require('../assets/Logo1(1).png')}
          />

          <Text style={styles.title}>
            Sign Up to <Text style={{ color: '#009688' }}>Veriteeth</Text>
          </Text>

          <Text style={styles.subtitle}>Book Appointments Effortlessly</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              onChangeText={(name) => setForm({ ...form, name })}
              placeholder="First Name"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={form.name}
            />
          </View>

          <View style={styles.input}>
            <Text style={styles.inputLabel}>Surname</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              onChangeText={(surname) => setForm({ ...form, surname })}
              placeholder="Surname"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={form.surname}
            />
          </View>

          <View style={styles.input}>
            <Text style={styles.inputLabel}>Email address</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              keyboardType="email-address"
              onChangeText={(email) => setForm({ ...form, email })}
              placeholder="sample@gmail.com"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={form.email}
            />
          </View>

          <View style={styles.input}>
            <Text style={styles.inputLabel}>Set Password</Text>
            <TextInput
              autoCorrect={false}
              clearButtonMode="while-editing"
              onChangeText={(password) => setForm({ ...form, password })}
              placeholder="********"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              secureTextEntry={true}
              value={form.password}
            />
          </View>

          {/* New Confirm Password Field */}
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              autoCorrect={false}
              clearButtonMode="while-editing"
              onChangeText={(confirmPassword) => setForm({ ...form, confirmPassword })}
              placeholder="********"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              secureTextEntry={true}
              value={form.confirmPassword}
            />
          </View>

          <View style={styles.formAction}>
            <TouchableOpacity onPress={signUpWithEmail} disabled={loading}>
              <View style={styles.btn}>
                <Text style={styles.btnText}>{loading ? 'Signing up...' : 'Sign Up'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
        <Text style={styles.formFooter}>
          Already have an account?{' '}
          <Text style={{ textDecorationLine: 'underline', color: '#009688' }}>Sign in</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  title: {
    fontSize: 31,
    fontWeight: '700',
    color: '#1D2A32',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
  },
  /** Header */
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 36,
  },
  headerImg: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 30,
  },
  /** Form */
  form: {
    marginBottom: 24,
    paddingHorizontal: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  formAction: {
    marginTop: 4,
    marginBottom: 16,
  },
  formLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF003F',
    textAlign: 'center',
  },
  formFooter: {
    paddingVertical: 24,
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    letterSpacing: 0.15,
  },
  /** Input */
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  inputControl: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
    borderStyle: 'solid',
  },
  /** Button */
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#009688',
    borderColor: '#009688',
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
});
