import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TranslatedText from '../../components/TranslatedText';
import { useTheme } from '../../components/ThemeContext';

const AREnvironment = ({ navigation }) => {
  const { colors } = useTheme();

  const arFeatures = [
    {
      icon: 'cube',
      title: '3D Models',
      description: 'Interact with detailed 3D models and objects'
    },
    {
      icon: 'eye',
      title: 'Virtual Reality',
      description: 'Immersive learning experiences'
    },
    {
      icon: 'hand-pointer',
      title: 'Touch Interaction',
      description: 'Manipulate objects with gestures'
    },
    {
      icon: 'brain',
      title: 'AI Guidance',
      description: 'Smart learning assistance'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <FontAwesome6 name="arrow-left" size={20} color="#E67012" />
        </TouchableOpacity>
        <TranslatedText style={styles.headerTitle}>AR Environment</TranslatedText>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.heroGradient}
          >
            <FontAwesome6 name="cube" size={64} color="white" />
            <Text style={styles.heroTitle}>Augmented Reality Learning</Text>
            <Text style={styles.heroSubtitle}>
              Step into immersive 3D environments designed to enhance your understanding
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Features
          </Text>
          
          {arFeatures.map((feature, index) => (
            <View key={index} style={[styles.featureCard, { backgroundColor: colors.card }]}>
              <View style={[styles.featureIcon, { backgroundColor: '#667eea20' }]}>
                <FontAwesome6 name={feature.icon} size={24} color="#667eea" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.muted }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.comingSoonSection}>
          <View style={[styles.comingSoonCard, { backgroundColor: colors.card }]}>
            <FontAwesome6 name="clock" size={32} color="#FF9800" />
            <Text style={[styles.comingSoonTitle, { color: colors.text }]}>
              Coming Soon
            </Text>
            <Text style={[styles.comingSoonText, { color: colors.muted }]}>
              AR Environment is currently in development. Stay tuned for an amazing immersive learning experience!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E67012',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  comingSoonSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  comingSoonCard: {
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AREnvironment;