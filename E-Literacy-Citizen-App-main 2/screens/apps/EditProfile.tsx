import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useUser } from '../../components/UserContext';
import TranslatedText from '../../components/TranslatedText';
import { updateProfile } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Edit Profile'>;

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { userData, setUserData } = useUser();
  const name = userData.name || '';
  const [email, setEmail] = useState(userData.email || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateProfile({ email: email.trim() });
      
      // Update local state
      const updatedUser = { ...userData, email: response.user.email };
      setUserData(updatedUser);
      
      // Update AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={{ fontSize: 22, color: '#E67012' }}>{'←'}</Text>
        </TouchableOpacity>
        <TranslatedText style={[styles.title, { flex: 1, textAlign: 'center', marginBottom: 0 }]}>Edit Profile</TranslatedText>
      </View>
      <View style={{padding: 24}}>
        <View style={styles.formGroup}>
          <TranslatedText style={styles.warning}>*You are not allowed to edit your name as it is linked to your account. However, you may update your email</TranslatedText>
          <TranslatedText style={styles.label}>Name</TranslatedText>
          <TextInput
            style={[styles.input, { backgroundColor: '#eee', color: '#888' }]}
            value={name}
            editable={false}
            placeholder={name}
            placeholderTextColor="#888"
          />
        </View>
        <View style={styles.formGroup}>
          <TranslatedText style={styles.label}>Email</TranslatedText>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          <LinearGradient
            colors={isLoading ? ['#ccc', '#999'] : ['#FF9800', '#FF6D00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
          />
          <TranslatedText style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </TranslatedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // padding: ,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E67012',
    marginBottom: 32,
    textAlign: 'center',
  },
  warning:{
    fontSize: 14,
    color: 'red',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E67012',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
   
  },
  saveButton: {
    backgroundColor: '#E67012',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  
});

export default EditProfileScreen;
