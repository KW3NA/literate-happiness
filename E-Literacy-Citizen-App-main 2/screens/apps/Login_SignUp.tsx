import * as React from 'react';
import { useState } from 'react';
import { useUser } from '../../components/UserContext';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, ActivityIndicator, Modal } from 'react-native';
import { requestAndFetchLocation, getLocationNameFromCoords } from '../../components/locationUtils';
import Constants from 'expo-constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import TranslatedText from '../../components/TranslatedText';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiPost, updateProfile, sendPhoneRegistrationOtp, sendPhoneLoginOtp } from '../../config/api';
import { supabase } from '../../config/supabase';



type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const Login_SignUp = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [name, setName] = useState<string>('');
  
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'Login' | 'Signup'>('Login');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPhoneSignup, setIsPhoneSignup] = useState<boolean>(false);
  const [countryCode] = useState<string>('+27'); // Default South Africa
  const [showMaintenanceModal, setShowMaintenanceModal] = useState<boolean>(false);

  const { setUserData } = useUser();
  const handleSubmit = async () => {
  if (isLoading) return;
  setIsLoading(true);

  // Handle phone authentication
  if (isPhoneSignup) {
    try {
      // Format phone number: remove leading 0 if present
      const formattedPhone = phoneNumber.startsWith('0') 
        ? phoneNumber.substring(1) 
        : phoneNumber;

      // Validate phone number (should be 9-10 digits)
      if (!formattedPhone || formattedPhone.length < 9 || formattedPhone.length > 10) {
        Alert.alert('Error', 'Please enter a valid phone number');
        setIsLoading(false);
        return;
      }

      if (activeTab === 'Signup') {
        // Validate signup fields
        if (!name) {
          Alert.alert('Error', 'Please enter your name');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }

        // Send registration OTP
        const response = await sendPhoneRegistrationOtp(formattedPhone, countryCode);
        if (response.status === 'success') {
          // Navigate to phone verification screen
          navigation.navigate('PhoneVerification', {
            phoneNumber: formattedPhone,
            countryCode,
            type: 'registration',
            name,
            password,
          });
        } else {
          Alert.alert('Error', response.message || 'Failed to send verification code');
        }
      } else {
        // Login with phone
        const response = await sendPhoneLoginOtp(formattedPhone, countryCode);
        if (response.status === 'success') {
          // Navigate to phone verification screen
          navigation.navigate('PhoneVerification', {
            phoneNumber: formattedPhone,
            countryCode,
            type: 'login',
          });
        } else {
          Alert.alert('Error', response.message || 'Failed to send verification code');
        }
      }
    } catch (error: any) {
      console.error('Phone authentication error:', error);
      Alert.alert('Error', error.message || 'Failed to process phone authentication');
    } finally {
      setIsLoading(false);
    }
    return;
  }

    // Handle email authentication (original code)
    let locationName = '';
    try {
      // Try fetching location if permissions are given
      const loc = await requestAndFetchLocation();
      if (loc && loc.permission) {
        const { latitude, longitude } = loc.coords;
        const apiKey =
          Constants.expoConfig?.extra?.OPENCAGE_API_KEY ||
          (Constants.manifest && 'extra' in Constants.manifest
            ? (Constants.manifest as any).extra?.OPENCAGE_API_KEY
            : '') ||
          '';
        locationName = (await getLocationNameFromCoords(latitude, longitude, apiKey)) || '';
      }
    } catch (e) {
      console.log('Location fetch failed:', e);
    }

    if (activeTab === 'Login') {
    try {
      console.log('Submitting login…', { email });

      // First check with Supabase database
      try {
        const { data: authData } = await supabase.auth.signInWithPassword({ email, password });
        if (authData?.session) {
          const { data: dbUser } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
          const userWithLocation = {
            id: dbUser?.id || authData.user.id,
            name: dbUser?.name || email.split('@')[0],
            email: email,
            role: 'citizen',
            location: locationName,
            profile_picture_url: dbUser?.profile_picture_url || 'https://i.pravatar.cc/200?u=' + email,
            currentLevel: dbUser?.current_level || 'Beginner'
          };
          await AsyncStorage.multiSet([
            ['token', authData.session.access_token],
            ['user', JSON.stringify(userWithLocation)],
          ]);
          setUserData(userWithLocation);
          navigation.reset({ index: 0, routes: [{ name: 'Home Screen' as never }] });
          return;
        }

        const { data: seededUser } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
        if (seededUser) {
          const userWithLocation = {
            id: seededUser.id,
            name: seededUser.name,
            email: seededUser.email,
            role: seededUser.role === 'learner' ? 'citizen' : seededUser.role,
            location: locationName,
            profile_picture_url: seededUser.profile_picture_url || 'https://i.pravatar.cc/200?u=' + seededUser.id,
            currentLevel: seededUser.current_level || 'Beginner'
          };
          await AsyncStorage.multiSet([
            ['token', 'supabase-token-' + seededUser.id],
            ['user', JSON.stringify(userWithLocation)],
          ]);
          setUserData(userWithLocation);
          navigation.reset({ index: 0, routes: [{ name: 'Home Screen' as never }] });
          return;
        }
      } catch (sbErr) {
        console.log('Supabase check fallback:', sbErr);
      }

      const data = await apiPost('/mobile/login', { email, password });
      console.log('Login payload:', data);

      // Guard against invalid response
      if (!data || typeof data !== 'object') {
        console.error('Invalid response from server:', data);
        Alert.alert('Login failed', 'Server returned an invalid response.');
        return;
      }

      // Check if email verification is required first
      if (data.email_verification_required) {
        navigation.navigate('EmailVerification');
        return;
      }

      // Check if 2FA is required
      if (data.two_factor_required) {
        // Navigate to 2FA screen - no token needed yet
        navigation.navigate('TwoFactor', { 
          email: data.email || email, 
          user: data.user 
        });
        return;
      }

      // If we reach here, login was successful and we should have a token
      if (!data.token) {
        console.error('No token in response:', data);
        Alert.alert('Login failed', 'Server did not return a token. Response: ' + JSON.stringify(data));
        return;
      }

      // Attach location to user before saving
      const userWithLocation = {
        ...data.user,
        location: locationName,
      };

      await AsyncStorage.multiSet([
        ['token', data.token],
        ['user', JSON.stringify(userWithLocation)],
      ]);

      // Save in context too
      setUserData({
        ...userWithLocation,
        joinDate: data.user?.joinDate ?? new Date().toLocaleDateString(),
        completedCourses: data.user?.completedCourses ?? 0,
        currentLevel: data.user?.currentLevel ?? 'Beginner',
      });

      // Save location to backend if we have it
      if (locationName) {
        try {
          await updateProfile({ location: locationName });
          console.log('Location saved to backend:', locationName);
        } catch (error) {
          console.log('Failed to save location to backend:', error);
          // Don't block login flow if location save fails
        }
      }

      // Navigate to home screen
      navigation.reset({ index: 0, routes: [{ name: 'Home Screen' as never }] });
    } catch (e: any) {
      console.error('Login error:', e);
      if (e.message && e.message.toLowerCase().includes('network')) {
        setShowMaintenanceModal(true);
      } else {
        const errorMessage = e.message || 'Please check your credentials and try again';
        Alert.alert('Login failed', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  } else {
    // SIGNUP
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      setIsLoading(false);
      return;
    }
    try {
      console.log('Submitting signup…', { email });

      // Create user in Supabase
      try {
        await supabase.auth.signUp({ email, password });
        const { data: newUser } = await supabase.from('users').insert({
          name: name || email.split('@')[0],
          email: email,
          role: 'learner',
          province: 'GP',
          status: 'active',
          current_level: 'Beginner'
        }).select().maybeSingle();

        const userObj = {
          id: newUser?.id || 'learner-' + Date.now(),
          name: name || email.split('@')[0],
          email: email,
          role: 'citizen',
          location: locationName,
          currentLevel: 'Beginner'
        };

        await AsyncStorage.multiSet([
          ['token', 'supabase-token-' + userObj.id],
          ['user', JSON.stringify(userObj)],
          ['isNewUser', 'true'],
        ]);
        setUserData(userObj);
        Alert.alert('Success', 'Account created successfully!');
        navigation.reset({ index: 0, routes: [{ name: 'Home Screen' as never }] });
        return;
      } catch (sbErr) {
        console.log('Supabase signup fallback:', sbErr);
      }

      const data = await apiPost('/mobile/register', {
        name: email.split('@')[0], // Use email prefix as fallback name
        email,
        password,
        password_confirmation: confirmPassword,
      });
      console.log('Signup payload:', data);

      if (!data || typeof data !== 'object' || !data.token) {
        Alert.alert('Signup failed', 'Server did not return a token.');
        return;
      }

      const userWithLocation = {
        ...data.user,
        location: locationName,
      };

      await AsyncStorage.multiSet([
        ['token', data.token],
        ['user', JSON.stringify(userWithLocation)],
        ['isNewUser', 'true'],
      ]);

      setUserData({
        ...userWithLocation,
        joinDate: data.user?.joinDate ?? new Date().toLocaleDateString(),
        completedCourses: data.user?.completedCourses ?? 0,
        currentLevel: data.user?.currentLevel ?? 'Beginner',
      });

      // Save location to backend if we have it
      if (locationName) {
        try {
          await updateProfile({ location: locationName });
          console.log('Location saved to backend:', locationName);
        } catch (error) {
          console.log('Failed to save location to backend:', error);
          // Don't block signup flow if location save fails
        }
      }

      // Check if email verification is required
      if (data.email_verification_required) {
        navigation.navigate('EmailVerification');
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Home Screen' as never }] });
      }
    } catch (e: any) {
      if (e.message && e.message.toLowerCase().includes('network')) {
        setShowMaintenanceModal(true);
      } else {
        Alert.alert('Signup failed', e.message ?? 'Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  }
};


  return (
    <ScrollView style={styles.container}>
      {/* Logo & Heading */}
      <View style={styles.heading}>
       
          <Image source={require('../../assets/logo.jpg')} style={{ width: 220, height: 200 }}  />
        
        <TranslatedText style={styles.subtitle}>Empowering Digital Futures</TranslatedText>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          onPress={() => setActiveTab('Login')} 
          style={[styles.tab, activeTab === 'Login' && styles.activeTab]}
        >
          <TranslatedText style={[styles.tabText, activeTab === 'Login' && styles.activeTabText]}>Log In</TranslatedText>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('Signup')} 
          style={[styles.tab, activeTab === 'Signup' && styles.activeTab]}
        >
          <TranslatedText style={[styles.tabText, activeTab === 'Signup' && styles.activeTabText]}>Sign Up</TranslatedText>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        {isPhoneSignup ? (
          <>
            {/* Phone Number Input */}
            <View style={styles.phoneContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCode}>+27</Text>
              </View>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="0800000000"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
                placeholderTextColor="#666"
              />
            </View>

            {/* Name input for signup */}
            {activeTab === 'Signup' && (
              <TextInput
                style={styles.input}
                placeholder={t('loginScreen.fullNamePlaceholder')}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholderTextColor="#666"
              />
            )}
          </>
        ) : (
          <TextInput
            style={styles.input}
            placeholder={t('loginScreen.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#666"
          />
        )}

        {/* Password Input with Eye Icon - only for email auth or signup with phone */}
        {(!isPhoneSignup || activeTab === 'Signup') && (
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('loginScreen.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              placeholderTextColor="#666"
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
              <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'Signup' && (!isPhoneSignup || password) && (
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('loginScreen.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isPasswordVisible}
              placeholderTextColor="#666"
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
              <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
            </TouchableOpacity>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#FF9800', '#FF6D00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
          />
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <TranslatedText style={styles.buttonText}>
              {isPhoneSignup 
                ? (activeTab === 'Login' ? 'Send OTP' : 'Continue')
                : (activeTab === 'Login' ? 'Log In' : 'Sign Up')
              }
            </TranslatedText>
          )}
        </TouchableOpacity>
        {(activeTab === 'Signup' || activeTab === 'Login') && (
          <TranslatedText style={{textAlign:'center', marginVertical: 10, color: '#666'}}>or</TranslatedText>
        )}
        {activeTab === 'Signup' && (
          <TouchableOpacity
            style={[styles.button_num, isLoading && { opacity: 0.7 }]}
            onPress={() => setIsPhoneSignup(!isPhoneSignup)}
          >
            <LinearGradient
              colors={['#1DACFF', '#1E90FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 6 }]}
            />
            <TranslatedText style={styles.buttonText}>
              {isPhoneSignup ? 'Register with Email' : 'Register with Phone Number'}
            </TranslatedText>
          </TouchableOpacity>
        )}
        {activeTab === 'Login' && (
          <TouchableOpacity
            style={[styles.button_num, isLoading && { opacity: 0.7 }]}
            onPress={() => setIsPhoneSignup(!isPhoneSignup)}
          >
            <LinearGradient
              colors={['#1DACFF', '#1E90FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 6 }]}
            />
            <TranslatedText style={styles.buttonText}>
              {isPhoneSignup ? 'Login with Email' : 'Login with Phone Number'}
            </TranslatedText>
          </TouchableOpacity>
        )}

        {/* Forgot Password Link - Only show on Login tab */}
        {activeTab === 'Login' && (
          <TouchableOpacity
            style={styles.forgotPasswordLink}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <TranslatedText style={styles.forgotPasswordText}>
              Forgot Password?
            </TranslatedText>
          </TouchableOpacity>
        )}

        {/* Footer Links */}
        {activeTab === 'Login' ? (
          <View style={styles.footerContainer}>
            <Text style={styles.divider}>•</Text>
            <TouchableOpacity onPress={() => setActiveTab('Signup')}>
              <TranslatedText style={styles.forgotText}>Create account</TranslatedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setActiveTab('Login')} style={styles.footerContainer}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.forgotText}>Login</Text></Text>
          </TouchableOpacity>
        )}

        {/* Social Login Section */}
        <TranslatedText style={styles.orText}>Or login with</TranslatedText>
        <View style={styles.socialContainer}>
          <Ionicons name="logo-google" size={32} color="#EA4335" style={styles.socialIcon} />
          <Ionicons name="logo-apple" size={32} color="#909092ff" style={styles.socialIcon} />
          <Ionicons name="logo-facebook" size={32} color="#1877F2" style={styles.socialIcon} />
        </View>
      </View>
      
      <Modal
        visible={showMaintenanceModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="construct" size={48} color="#FF9800" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Under Maintenance</Text>
            <Text style={styles.modalMessage}>
              Our servers are currently under maintenance. Please try again later.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowMaintenanceModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginTop: 25,
  },
  
  logoText: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    bottom: 26,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    bottom: 46,
  },
  tab: {
    flex: 1,
    maxWidth: 150,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#E67012',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'gray',
  },
  activeTabText: {
    color: '#E67012',
  },
  formContainer: {
    paddingHorizontal: 24,
    bottom: 26,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 13,
  },
  button: {
    backgroundColor: '#E67012',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  button_num:{
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:5,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#E67012',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  forgotText: {
    color: '#419affff',
    fontSize: 14,
  },
  divider: {
    marginHorizontal: 8,
    color: 'gray',
  },
  loginText: {
    color: 'gray',
    fontSize: 14,
  },
  orText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 24,
    marginBottom: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  socialIcon: {
    marginHorizontal: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  countryCodeContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 32,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Login_SignUp;
