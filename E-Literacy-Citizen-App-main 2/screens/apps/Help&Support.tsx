import * as React from 'react';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../components/ThemeContext';
import TranslatedText from '../../components/TranslatedText';

type Props = NativeStackScreenProps<RootStackParamList, 'Help&Support'>;

const HelpSupport = ({ navigation }: Props) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { colors, isDark } = useTheme();

  const handleSubmitMessage = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      Alert.alert(
        'Message Sent!',
        'Thank you for contacting us. We will get back to you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setName('');
              setEmail('');
              setMessage('');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#E67012" />
        </TouchableOpacity>
        <TranslatedText style={[styles.headerTitle, { color: colors.primary }]}>Help & Support</TranslatedText>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          
          <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
            
            <Text style={[styles.heading, { color: colors.text }]}>Need Help?</Text>
            
            
            <TranslatedText style={[styles.subtitle, { color: colors.muted }]}>
              Send us a message and we will get back to you.
            </TranslatedText>

            
            <View style={styles.inputContainer}>
              <TranslatedText style={[styles.label, { color: colors.text }]}>Name</TranslatedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#2c2c2e' : '#f8f8f8',
                    color: colors.text,
                    borderColor: isDark ? '#3c3c3e' : '#e0e0e0'
                  }
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.muted}
                editable={!isSubmitting}
              />
            </View>

            
            <View style={styles.inputContainer}>
              <TranslatedText style={[styles.label, { color: colors.text }]}>Email</TranslatedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#2c2c2e' : '#f8f8f8',
                    color: colors.text,
                    borderColor: isDark ? '#3c3c3e' : '#e0e0e0'
                  }
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>

            {/* Message Input */}
            <View style={styles.inputContainer}>
              <TranslatedText style={[styles.label, { color: colors.text }]}>Message</TranslatedText>
              <TextInput
                style={[
                  styles.messageInput,
                  { 
                    backgroundColor: isDark ? '#2c2c2e' : '#f8f8f8',
                    color: colors.text,
                    borderColor: isDark ? '#3c3c3e' : '#e0e0e0'
                  }
                ]}
                value={message}
                onChangeText={setMessage}
                placeholder="Enter your message here..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmitMessage}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#FF9800', '#FF6D00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
              />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Sending...' : 'Submit Message'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Additional Help Section */}
          <View style={[styles.additionalHelpContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.additionalHelpTitle, { color: colors.text }]}>Other Ways to Get Help</Text>
            
            <View style={styles.helpOptionContainer}>
              <Ionicons name="mail-outline" size={24} color="#E67012" />
              <View style={styles.helpOptionText}>
                <Text style={[styles.helpOptionTitle, { color: colors.text }]}>Email Support</Text>
                <Text style={[styles.helpOptionSubtitle, { color: colors.muted }]}>support@eliteracy.com</Text>
              </View>
            </View>

            <View style={styles.helpOptionContainer}>
              <Ionicons name="call-outline" size={24} color="#E67012" />
              <View style={styles.helpOptionText}>
                <Text style={[styles.helpOptionTitle, { color: colors.text }]}>Phone Support</Text>
                <Text style={[styles.helpOptionSubtitle, { color: colors.muted }]}>+27 11 123 4567</Text>
              </View>
            </View>

            <View style={styles.helpOptionContainer}>
              <Ionicons name="time-outline" size={24} color="#E67012" />
              <View style={styles.helpOptionText}>
                <Text style={[styles.helpOptionTitle, { color: colors.text }]}>Support Hours</Text>
                <Text style={[styles.helpOptionSubtitle, { color: colors.muted }]}>Mon - Fri, 9:00 AM - 5:00 PM</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    minHeight: 120,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    position: 'relative',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  additionalHelpContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  additionalHelpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  helpOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  helpOptionText: {
    marginLeft: 16,
    flex: 1,
  },
  helpOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  helpOptionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default HelpSupport;