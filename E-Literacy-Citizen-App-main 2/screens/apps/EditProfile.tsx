import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
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
  const [province, setProvince] = useState((userData as any).province || 'GP');
  const [level, setLevel] = useState((userData as any).current_level || (userData as any).currentLevel || 'Beginner');
  const [isLoading, setIsLoading] = useState(false);

  const PROVINCES = [
    { code: 'GP', name: 'Gauteng (GP)' },
    { code: 'WC', name: 'Western Cape (WC)' },
    { code: 'KZN', name: 'KwaZulu-Natal (KZN)' },
    { code: 'EC', name: 'Eastern Cape (EC)' },
    { code: 'LP', name: 'Limpopo (LP)' },
    { code: 'MP', name: 'Mpumalanga (MP)' },
    { code: 'NW', name: 'North West (NW)' },
    { code: 'FS', name: 'Free State (FS)' },
    { code: 'NC', name: 'Northern Cape (NC)' },
  ];

  const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

  const handleSave = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateProfile({
        email: email.trim(),
        province,
        current_level: level,
        currentLevel: level,
      });

      // Update local state
      const updatedUser = {
        ...userData,
        email: response.user.email,
        province,
        current_level: level,
        currentLevel: level,
      };
      setUserData(updatedUser);

      // Update AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      Alert.alert('Success', 'Profile and province synced with Supabase!');
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
      <ScrollView contentContainerStyle={{padding: 24, paddingBottom: 40}}>
        <View style={styles.formGroup}>
          <TranslatedText style={styles.warning}>*Name is verified with national accreditation records. You may update your email, province, and proficiency level.</TranslatedText>
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
          <TranslatedText style={styles.label}>Email Address</TranslatedText>
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

        <View style={styles.formGroup}>
          <TranslatedText style={styles.label}>South African Province</TranslatedText>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4}}>
            {PROVINCES.map((p) => {
              const selected = province === p.code;
              return (
                <TouchableOpacity
                  key={p.code}
                  onPress={() => setProvince(p.code)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: selected ? '#E67012' : '#ccc',
                    backgroundColor: selected ? '#FFF4EC' : '#fff',
                  }}
                >
                  <Text style={{fontSize: 12, fontWeight: selected ? '700' : '400', color: selected ? '#E67012' : '#333'}}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.formGroup}>
          <TranslatedText style={styles.label}>Digital Literacy Level</TranslatedText>
          <View style={{flexDirection: 'row', gap: 8, marginTop: 4}}>
            {LEVELS.map((lvl) => {
              const selected = level === lvl;
              return (
                <TouchableOpacity
                  key={lvl}
                  onPress={() => setLevel(lvl)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: selected ? '#E67012' : '#ccc',
                    backgroundColor: selected ? '#FFF4EC' : '#fff',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{fontSize: 13, fontWeight: selected ? '700' : '500', color: selected ? '#E67012' : '#333'}}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled, {marginTop: 16}]}
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
            {isLoading ? 'Saving...' : 'Save & Sync Profile'}
          </TranslatedText>
      </ScrollView>
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
