import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import TranslatedText from '../../components/TranslatedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../components/UserContext';
import {
  verifyPhoneLoginOtp,
  verifyPhoneRegistrationOtp,
  resendPhoneOtp,
  updateProfile,
} from '../../config/api';
import { requestAndFetchLocation, getLocationNameFromCoords } from '../../components/locationUtils';
import Constants from 'expo-constants';

type Props = NativeStackScreenProps<RootStackParamList, 'PhoneVerification'>;

interface PhoneVerificationParams {
  phoneNumber: string;
  countryCode: string;
  type: 'login' | 'registration';
  name?: string;
  password?: string;
}

const PhoneVerificationScreen = ({ navigation, route }: Props) => {
  const params = route.params as PhoneVerificationParams;
  const { phoneNumber, countryCode, type, name, password } = params;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { setUserData } = useUser();

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
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

    try {
      let response;

      if (type === 'registration') {
        if (!name || !password) {
          Alert.alert('Error', 'Missing registration information');
          return;
        }
        response = await verifyPhoneRegistrationOtp(phoneNumber, otpCode, name, password, countryCode);
      } else {
        response = await verifyPhoneLoginOtp(phoneNumber, otpCode, countryCode);
      }

      if (response.status === 'success' && response.token && response.user) {
        // Attach location to user
        const userWithLocation = {
          ...response.user,
          location: locationName,
        };

        await AsyncStorage.multiSet([
          ['token', response.token],
          ['user', JSON.stringify(userWithLocation)],
        ]);

        setUserData({
          ...userWithLocation,
          joinDate: response.user?.joinDate ?? new Date().toLocaleDateString(),
          completedCourses: response.user?.completedCourses ?? 0,
          currentLevel: response.user?.currentLevel ?? 'Beginner',
        });

        // Save location to backend if available
        if (locationName) {
          try {
            await updateProfile({ location: locationName });
            console.log('Location saved to backend:', locationName);
          } catch (error) {
            console.log('Failed to save location to backend:', error);
          }
        }

        // Navigate to home
        navigation.reset({ index: 0, routes: [{ name: 'Home Screen' as never }] });
      } else {
        Alert.alert('Verification Failed', response.message || 'Invalid OTP code');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      Alert.alert('Verification Failed', error.message || 'Please check your code and try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsResending(true);
    try {
      const response = await resendPhoneOtp(phoneNumber, type, countryCode);

      if (response.status === 'success') {
        Alert.alert('Success', 'A new verification code has been sent');
        setTimer(60);
        setCanResend(false);

        // Restart timer
        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        Alert.alert('Error', response.message || 'Failed to resend code');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <TranslatedText style={styles.title}>Verify Your Phone</TranslatedText>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to {'\n'}
          {countryCode} {phoneNumber}
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, isLoading && { opacity: 0.7 }]}
          onPress={handleVerify}
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
            <TranslatedText style={styles.verifyButtonText}>Verify</TranslatedText>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              {isResending ? (
                <ActivityIndicator size="small" color="#FF9800" />
              ) : (
                <TranslatedText style={styles.resendText}>Resend Code</TranslatedText>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend code in {timer}s
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <TranslatedText style={styles.backButtonText}>
            Change Phone Number
          </TranslatedText>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 50,
    height: 56,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  otpInputFilled: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  verifyButton: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    color: '#FF9800',
    fontSize: 16,
    fontWeight: '600',
  },
  timerText: {
    color: '#999',
    fontSize: 14,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  backButtonText: {
    color: '#419affff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PhoneVerificationScreen;



