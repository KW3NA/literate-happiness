import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { requestAndFetchLocation, getLocationNameFromCoords } from './locationUtils';
import Constants from 'expo-constants';

const LocationTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const testLocation = async () => {
    setIsLoading(true);
    setDebugInfo([]);
    
    try {
      addDebugInfo('🔍 Starting location test...');
      
      // Check API key
      const OPENCAGE_API_KEY = 
        Constants.expoConfig?.extra?.OPENCAGE_API_KEY ||
        (Constants.manifest && 'extra' in Constants.manifest
          ? (Constants.manifest as any).extra?.OPENCAGE_API_KEY
          : '') ||
        '';
      
      addDebugInfo(`🔑 API Key available: ${!!OPENCAGE_API_KEY}`);
      addDebugInfo(`🔑 API Key length: ${OPENCAGE_API_KEY.length}`);
      addDebugInfo(`🔑 API Key preview: ${OPENCAGE_API_KEY.substring(0, 8)}...`);
      
      if (!OPENCAGE_API_KEY) {
        addDebugInfo('❌ No API key found! Please set OPENCAGE_API_KEY in your .env file');
        Alert.alert('Configuration Error', 'OpenCage API key is not configured. Please add OPENCAGE_API_KEY to your .env file.');
        return;
      }
      
      // Test location permission and fetching
      addDebugInfo('📍 Requesting location permission...');
      const loc = await requestAndFetchLocation();
      
      if (!loc || !loc.permission) {
        addDebugInfo('❌ Location permission denied or failed');
        Alert.alert('Permission Error', 'Location permission is required. Please enable location access.');
        return;
      }
      
      addDebugInfo(`✅ Location obtained: ${loc.coords.latitude}, ${loc.coords.longitude}`);
      
      // Test geocoding
      addDebugInfo('🌍 Testing geocoding API...');
      const locationName = await getLocationNameFromCoords(
        loc.coords.latitude, 
        loc.coords.longitude, 
        OPENCAGE_API_KEY
      );
      
      if (locationName) {
        addDebugInfo(`✅ Location name: ${locationName}`);
        Alert.alert('Success!', `Location found: ${locationName}`);
      } else {
        addDebugInfo('❌ Failed to get location name from API');
        Alert.alert('API Error', 'Could not resolve location name. Check your API key and internet connection.');
      }
      
    } catch (error) {
      addDebugInfo(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      Alert.alert('Error', `Location test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={testLocation}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing Location...' : 'Test Location API'}
        </Text>
      </TouchableOpacity>
      
      {debugInfo.length > 0 && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Log:</Text>
          {debugInfo.map((info, index) => (
            <Text key={index} style={styles.debugText}>{info}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    margin: 16,
  },
  button: {
    backgroundColor: '#E67012',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  debugContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
});

export default LocationTest;


