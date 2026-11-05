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
import Ionicons from 'react-native-vector-icons/Ionicons';
import TranslatedText from '../../components/TranslatedText';
import { sendEmailOtp, verifyEmailOtp, SendOtpResponse, VerifyOtpResponse } from '../../config/api';
import { useUser } from '../../components/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'EmailVerification'>;

const EmailVerificationScreen = ({ navigation }: Props) => {
  const { userData } = useUser();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpSentAt, setOtpSentAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [maxResendAttempts] = useState(3);

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

  // Send OTP
  const handleSendOtp = async () => {
    if (resendAttempts >= maxResendAttempts) {
      Alert.alert(
        'Limit Reached',
        'You have reached the maximum number of resend attempts. Please try again later.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const response: SendOtpResponse = await sendEmailOtp();
      
      if (response.status === 'success') {
        setIsOtpSent(true);
        setOtpSentAt(response.data?.otp_sent_at || new Date().toISOString());
        setCountdown(60); // 60 seconds countdown
        setResendAttempts(prev => prev + 1);
        Alert.alert('Success', 'OTP sent to your email address');
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already verified')) {
        Alert.alert(
          'Already Verified',
          'Your email is already verified. You can now access all features.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
        return;
      }
      
      if (error.message?.includes('Please wait')) {
        Alert.alert('Please Wait', 'Please wait before requesting another OTP');
        return;
      }
      
      Alert.alert(
        'Error',
        error.message || 'Failed to send OTP. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response: VerifyOtpResponse = await verifyEmailOtp(otp);
      
      if (response.status === 'success') {
        Alert.alert(
          'Success',
          'Email verified successfully! You can now access all features.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to home screen after successful verification
                navigation.reset({ 
                  index: 0, 
                  routes: [{ name: 'Home Screen' as never }] 
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Invalid OTP. Please try again.');
        setOtp('');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already verified')) {
        Alert.alert(
          'Already Verified',
          'Your email is already verified. You can now access all features.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({ 
                  index: 0, 
                  routes: [{ name: 'Home Screen' as never }] 
                });
              },
            },
          ]
        );
        return;
      }
      
      if (error.message?.includes('expired')) {
        Alert.alert(
          'OTP Expired',
          'The OTP has expired. Please request a new one.',
          [
            {
              text: 'Request New OTP',
              onPress: () => handleSendOtp(),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
        setOtp('');
        return;
      }
      
      Alert.alert(
        'Error',
        error.message || 'Failed to verify OTP. Please try again.'
      );
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (countdown > 0) {
      Alert.alert('Please Wait', `Please wait ${countdown} seconds before resending OTP`);
      return;
    }
    handleSendOtp();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#E67012" />
          </TouchableOpacity>
          <TranslatedText style={styles.headerTitle}>Email Verification</TranslatedText>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={80} color="#E67012" />
          </View>

          {/* Title */}
          <TranslatedText style={styles.title}>Verify Your Email</TranslatedText>
          
          {/* Description */}
          <Text style={styles.description}>
            We've sent a 6-digit verification code to:
          </Text>
          <Text style={styles.email}>{userData?.email || 'your email address'}</Text>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              keyboardType="numeric"
              maxLength={6}
              autoFocus={isOtpSent}
              textAlign="center"
              autoComplete="one-time-code"
            />
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, (!otp.trim() || isLoading) && styles.verifyButtonDisabled]}
            onPress={handleVerifyOtp}
            disabled={!otp.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <TranslatedText style={styles.verifyButtonText}>Verify Email</TranslatedText>
            )}
          </TouchableOpacity>

          {/* Resend Section */}
          <View style={styles.resendContainer}>
            <TranslatedText style={styles.resendText}>Didn't receive the code?</TranslatedText>
            <TouchableOpacity
              style={[
                styles.resendButton,
                (countdown > 0 || isLoading || resendAttempts >= maxResendAttempts) && styles.resendButtonDisabled
              ]}
              onPress={handleResendOtp}
              disabled={countdown > 0 || isLoading || resendAttempts >= maxResendAttempts}
            >
              <Text style={[
                styles.resendButtonText,
                (countdown > 0 || isLoading || resendAttempts >= maxResendAttempts) && styles.resendButtonTextDisabled
              ]}>
                {countdown > 0 
                  ? `Resend in ${countdown}s` 
                  : resendAttempts >= maxResendAttempts 
                    ? 'Max attempts reached'
                    : 'Resend OTP'
                }
              </Text>
            </TouchableOpacity>
          </View>

          {/* Send OTP Button (if not sent yet) */}
          {!isOtpSent && (
            <TouchableOpacity
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
              onPress={handleSendOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <TranslatedText style={styles.sendButtonText}>Send OTP</TranslatedText>
              )}
            </TouchableOpacity>
          )}

          {/* Info */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              The OTP will expire in 10 minutes. Check your spam folder if you don't see the email.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E67012',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E67012',
    textAlign: 'center',
    marginBottom: 32,
  },
  otpContainer: {
    width: '100%',
    marginBottom: 24,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#E67012',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    backgroundColor: '#f8f9fa',
  },
  verifyButton: {
    backgroundColor: '#E67012',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#E67012',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButtonTextDisabled: {
    color: '#999',
  },
  sendButton: {
    backgroundColor: '#E67012',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    lineHeight: 20,
  },
});

export default EmailVerificationScreen;
