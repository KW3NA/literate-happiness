import React, { useState, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { send2FAOtp, verify2FAOtp } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../components/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TranslatedText from '../../components/TranslatedText';
type Props = NativeStackScreenProps<RootStackParamList, 'TwoFactor'>;

export default function TwoFactorScreen({ navigation, route }: Props) {
  const { email, user } = route.params;
  const { setUserData } = useUser();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [error, setError] = useState('');
  const maxResendAttempts = 3;

  // Countdown timer for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await verify2FAOtp(email, otp);
      
      if (data.two_factor_verified && data.token) {
        // Store token and user data
        await AsyncStorage.multiSet([
          ['token', data.token],
          ['user', JSON.stringify(data.user)],
        ]);

        // Save in context
        setUserData({
          ...data.user,
          joinDate: data.user?.joinDate ?? new Date().toLocaleDateString(),
          completedCourses: data.user?.completedCourses ?? 0,
          currentLevel: data.user?.currentLevel ?? 'Beginner',
        });

        // Navigate to home
        navigation.reset({ index: 0, routes: [{ name: 'Home Screen' as never }] });
      } else {
        setError(data.message || 'Verification failed. Please try again.');
      }
    } catch (e: any) {
      console.error('2FA verification error:', e);
      setError(e.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resendAttempts >= maxResendAttempts) return;

    setIsResending(true);
    setError('');

    try {
      const data = await send2FAOtp(email);
      
      if (data.message) {
        setCountdown(60); // 60 seconds countdown
        setResendAttempts(prev => prev + 1);
        Alert.alert('Code Sent', 'A new 2FA code has been sent to your email.');
      } else {
        setError(data.message || 'Failed to send code. Please try again.');
      }
    } catch (e: any) {
      console.error('Resend 2FA OTP error:', e);
      setError(e.message || 'Failed to send code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={32} color="#3b82f6" />
          </View>
          <TranslatedText style={styles.title}>Two-Factor Authentication</TranslatedText>
          <TranslatedText style={styles.subtitle}>
            We've sent a 6-digit verification code to:
          </TranslatedText>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <TranslatedText style={styles.errorText}>{error}</TranslatedText>
          </View>
        ) : null}

        {/* OTP Input */}
        <View style={styles.inputContainer}>
          <TranslatedText style={styles.inputLabel}>Enter 6-digit 2FA code</TranslatedText>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
            autoComplete="one-time-code"
          />
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (isLoading || otp.length !== 6) && styles.verifyButtonDisabled
          ]}
          onPress={handleVerifyOtp}
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <TranslatedText style={styles.verifyButtonText}>Verify 2FA Code</TranslatedText>
          )}
        </TouchableOpacity>

        {/* Resend Section */}
        <View style={styles.resendContainer}>
          <TranslatedText style={styles.resendLabel}>Didn't receive the code?</TranslatedText>
          <TouchableOpacity
            style={[
              styles.resendButton,
              (isResending || countdown > 0 || resendAttempts >= maxResendAttempts) && styles.resendButtonDisabled
            ]}
            onPress={handleResendOtp}
            disabled={isResending || countdown > 0 || resendAttempts >= maxResendAttempts}
          >
            {isResending ? (
              <ActivityIndicator color="#3b82f6" size="small" />
            ) : countdown > 0 ? (
              <Text style={styles.resendButtonText}>Resend in {countdown}s</Text>
            ) : resendAttempts >= maxResendAttempts ? (
              <TranslatedText style={styles.resendButtonText}>Max attempts reached</TranslatedText>
            ) : (
              <TranslatedText style={styles.resendButtonText}>Send 2FA Code</TranslatedText>
            )}
          </TouchableOpacity>
        </View>

        {/* Back to Login */}
        <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
          <Ionicons name="arrow-back" size={16} color="#6b7280" />
          <TranslatedText style={styles.backButtonText}>Back to Login</TranslatedText>
        </TouchableOpacity>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Ionicons name="help-circle-outline" size={16} color="#3b82f6" />
          <TranslatedText style={styles.securityText}>
           What is Two-Factor Authentication (2FA)? It keeps your account safe by making sure that it is really you when you log in.
          </TranslatedText>
        </View>
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={16} color="#3b82f6" />
          <TranslatedText style={styles.securityText}>
             The 2FA code will expire in 5 minutes. 
          </TranslatedText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#dc2626',
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    letterSpacing: 4,
  },
  verifyButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
  },
  resendButtonDisabled: {
    borderColor: '#d1d5db',
  },
  resendButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    color: '#6b7280',
    marginLeft: 4,
    fontSize: 14,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
  },
  securityText: {
    color: '#1e40af',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});
