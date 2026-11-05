// @ts-ignore
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../components/ThemeContext';
import TranslatedText from '../../components/TranslatedText';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';
import { 
  sendPasswordResetOtp, 
  verifyPasswordResetOtp, 
  resetPassword 
} from '../../config/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

type ForgotPasswordStep = 'email' | 'otp' | 'newPassword';

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const { colors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendPasswordResetOtp(email.trim());
      
      if (response.status === 'success') {
        setOtpSent(true);
        Alert.alert(
          'OTP Sent',
          'A password reset code has been sent to your email address.',
          [{ text: 'OK', onPress: () => setCurrentStep('otp') }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyPasswordResetOtp(email.trim(), otp.trim());
      
      if (response.status === 'success') {
        Alert.alert(
          'OTP Verified',
          'OTP verified successfully. You can now set your new password.',
          [{ text: 'OK', onPress: () => setCurrentStep('newPassword') }]
        );
      } else {
        Alert.alert('Error', response.message || 'Invalid or expired OTP');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword(
        email.trim(), 
        otp.trim(), 
        newPassword.trim(), 
        confirmPassword.trim()
      );
      
      if (response.status === 'success') {
        Alert.alert(
          'Success',
          'Your password has been reset successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      Alert.alert('Error', error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await sendPasswordResetOtp(email.trim());
      
      if (response.status === 'success') {
        Alert.alert('Success', 'A new OTP has been sent to your email');
      } else {
        Alert.alert('Error', response.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <FontAwesome6 name="envelope" size={48} color="#E67012" />
      </View>
      
      <TranslatedText style={[styles.title, { color: colors.text }]}>
        Forgot Password?
      </TranslatedText>
      
      <TranslatedText style={[styles.subtitle, { color: colors.muted }]}>
        Enter your email address and we'll send you a code to reset your password.
      </TranslatedText>

      <View style={styles.inputContainer}>
        <TranslatedText style={[styles.inputLabel, { color: colors.text }]}>
          Email Address
        </TranslatedText>
        <TextInput
          style={[styles.input, { 
            backgroundColor: isDark ? '#2a2a2a' : '#f8f8f8',
            color: colors.text,
            borderColor: isDark ? '#444' : '#ddd'
          }]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSendOtp}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#FF9800', '#FF6D00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <TranslatedText style={styles.primaryButtonText}>
            Send Reset Code
          </TranslatedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <TranslatedText style={[styles.backButtonText, { color: colors.primary }]}>
          Back to Login
        </TranslatedText>
      </TouchableOpacity>
    </View>
  );

  const renderOtpStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <FontAwesome6 name="key" size={48} color="#E67012" />
      </View>
      
      <TranslatedText style={[styles.title, { color: colors.text }]}>
        Enter Verification Code
      </TranslatedText>
      
      <TranslatedText style={[styles.subtitle, { color: colors.muted }]}>
        We've sent a 6-digit code to {email}
      </TranslatedText>

      <View style={styles.inputContainer}>
        <TranslatedText style={[styles.inputLabel, { color: colors.text }]}>
          Verification Code
        </TranslatedText>
        <TextInput
          style={[styles.input, styles.otpInput, { 
            backgroundColor: isDark ? '#2a2a2a' : '#f8f8f8',
            color: colors.text,
            borderColor: isDark ? '#444' : '#ddd'
          }]}
          value={otp}
          onChangeText={setOtp}
          placeholder="000000"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          maxLength={6}
          textAlign="center"
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleVerifyOtp}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#FF9800', '#FF6D00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <TranslatedText style={styles.primaryButtonText}>
            Verify Code
          </TranslatedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendOtp}
        disabled={isLoading}
      >
        <TranslatedText style={[styles.resendButtonText, { color: colors.primary }]}>
          Didn't receive the code? Resend
        </TranslatedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentStep('email')}
      >
        <TranslatedText style={[styles.backButtonText, { color: colors.primary }]}>
          Back to Email
        </TranslatedText>
      </TouchableOpacity>
    </View>
  );

  const renderNewPasswordStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <FontAwesome6 name="lock" size={48} color="#E67012" />
      </View>
      
      <TranslatedText style={[styles.title, { color: colors.text }]}>
        Set New Password
      </TranslatedText>
      
      <TranslatedText style={[styles.subtitle, { color: colors.muted }]}>
        Create a strong password for your account
      </TranslatedText>

      <View style={styles.inputContainer}>
        <TranslatedText style={[styles.inputLabel, { color: colors.text }]}>
          New Password
        </TranslatedText>
        <TextInput
          style={[styles.input, { 
            backgroundColor: isDark ? '#2a2a2a' : '#f8f8f8',
            color: colors.text,
            borderColor: isDark ? '#444' : '#ddd'
          }]}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <TranslatedText style={[styles.inputLabel, { color: colors.text }]}>
          Confirm Password
        </TranslatedText>
        <TextInput
          style={[styles.input, { 
            backgroundColor: isDark ? '#2a2a2a' : '#f8f8f8',
            color: colors.text,
            borderColor: isDark ? '#444' : '#ddd'
          }]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#FF9800', '#FF6D00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <TranslatedText style={styles.primaryButtonText}>
            Reset Password
          </TranslatedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentStep('otp')}
      >
        <TranslatedText style={[styles.backButtonText, { color: colors.primary }]}>
          Back to Verification
        </TranslatedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 'email' && renderEmailStep()}
          {currentStep === 'otp' && renderOtpStep()}
          {currentStep === 'newPassword' && renderNewPasswordStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    marginBottom: 16,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
