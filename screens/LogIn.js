import React, { useState, useEffect } from 'react';
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
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons'; // Expo icons

const ADMIN_EMAIL = 'silitrash0000@gmail.com';
const DENTIST_EMAIL = 'vincentson.dev@gmail.com';

export default function LogIn() {
  const navigation = useNavigation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Track password visibility
  const [rememberMe, setRememberMe] = useState(false); // Track "Remember Me" state

  useEffect(() => {
    // Load remembered credentials if "Remember Me" was previously checked
    const loadRememberedCredentials = async () => {
      const savedEmail = await AsyncStorage.getItem('email');
      const savedPassword = await AsyncStorage.getItem('password');
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');
      if (savedEmail && savedPassword && savedRememberMe === 'true') {
        setForm({ email: savedEmail, password: savedPassword });
        setRememberMe(true);
      }
    };
    loadRememberedCredentials();
  }, []);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const toggleRememberMe = () => setRememberMe(!rememberMe);

  const handleRememberMe = async () => {
    if (rememberMe) {
      // Save credentials
      await AsyncStorage.setItem('email', form.email);
      await AsyncStorage.setItem('password', form.password);
      await AsyncStorage.setItem('rememberMe', 'true');
    } else {
      // Clear credentials
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('password');
      await AsyncStorage.setItem('rememberMe', 'false');
    }
  };

  const signInWithEmail = async () => {
    setLoading(true);
    try {
      const { error, data: { user } } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else if (user) {
        Alert.alert('Success', 'Signed in successfully!');
        await handleRememberMe(); // Save or clear credentials based on "Remember Me"

        if (form.email === ADMIN_EMAIL) {
          navigation.replace('AdminHome');
        } else if (form.email === DENTIST_EMAIL) {
          navigation.replace('DentistHome');
        } else {
          navigation.replace('Main');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

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
            Sign in to <Text style={{ color: '#009688' }}>Veriteeth</Text>
          </Text>
          <Text style={styles.subtitle}>Book Appointments Effortlessly</Text>
        </View>

        <View style={styles.form}>
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
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                autoCorrect={false}
                clearButtonMode="while-editing"
                onChangeText={(password) => setForm({ ...form, password })}
                placeholder="********"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                secureTextEntry={!showPassword}
                value={form.password}
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rememberMeContainer}>
            <TouchableOpacity onPress={toggleRememberMe} style={styles.checkboxContainer}>
              <MaterialIcons
                name={rememberMe ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color="#009688"
              />
              <Text style={styles.checkboxLabel}>Remember me</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formAction}>
            <TouchableOpacity onPress={signInWithEmail} disabled={loading}>
              <View style={styles.btn}>
                <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.formLink}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.formFooter}>
          Don't have an account?{' '}
          <Text style={{ textDecorationLine: 'underline', color: '#009688' }}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Styles (added rememberMeContainer and checkboxContainer)
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
  form: {
    marginBottom: 24,
    paddingHorizontal: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
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
    flex: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 8,
    color: '#222',
  },
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
    marginBottom:15,
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
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
});
