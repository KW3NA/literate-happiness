import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TranslationService } from './translation';

export default function TranslationTest() {
  const [testResult, setTestResult] = useState<string>('');

  const testTranslation = async () => {
    try {
      setTestResult('Testing translation...');
      
      // Test with a simple text
      const result = await TranslationService.translateText('Hello world', 'af', 'en');
      setTestResult(`Translation result: ${result}`);
      
      if (result === 'Hello world') {
        Alert.alert('Warning', 'Translation returned original text - API might not be working');
      } else {
        Alert.alert('Success', 'Translation is working!');
      }
    } catch (error) {
      setTestResult(`Error: ${error}`);
      Alert.alert('Error', `Translation failed: ${error}`);
    }
  };

  const testConnection = async () => {
    try {
      setTestResult('Testing connection...');
      const isConnected = await TranslationService.testConnection();
      setTestResult(`Connection test: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
      Alert.alert('Connection Test', isConnected ? 'API is working!' : 'API connection failed');
    } catch (error) {
      setTestResult(`Connection error: ${error}`);
      Alert.alert('Error', `Connection test failed: ${error}`);
    }
  };

  const clearCache = () => {
    TranslationService.clearCache();
    setTestResult('Cache cleared');
    Alert.alert('Cache', 'Translation cache cleared');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Translation API Test</Text>
      
      <TouchableOpacity style={styles.button} onPress={testTranslation}>
        <Text style={styles.buttonText}>Test Translation</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testConnection}>
        <Text style={styles.buttonText}>Test Connection</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={clearCache}>
        <Text style={styles.buttonText}>Clear Cache</Text>
      </TouchableOpacity>
      
      <Text style={styles.result}>{testResult}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#E67012',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  result: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    fontSize: 12,
  },
}); 