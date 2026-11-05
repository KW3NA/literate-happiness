import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../components/ThemeContext';
import TranslatedText from '../../components/TranslatedText';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'Privacy'>;

const privacyPoints = [
  "Secure Storage – Your data is encrypted and stored safely.",
  "No Unwanted Sharing – We never sell or share your personal details with third parties.",
  "Transparency – We only collect information needed to improve your learning journey.",
  "Control in Your Hands – You decide what to share, update, or delete at any time.",
  "Safe Learning – Assessments, progress, and CV details remain private and visible only to you.",
  "Trusted Standards – We follow national and global data protection standards to keep you safe online.",
];

const PrivacyScreen: React.FC<Props> = ({ navigation }) => {
  const { isDark, colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with back button */}
      <View style={[styles.header, { backgroundColor: colors.card,}]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TranslatedText style={[styles.headerTitle, { color: colors.primary }]}>Privacy Policy</TranslatedText>
        <View style={{ width: 36 }} />
      </View>
         
      <ScrollView contentContainerStyle={styles.contentContainer}>
            <View style={styles.iconContainer}>
            <FontAwesome6 name="shield-halved" size={60} color={colors.primary} />
          </View>
          <TranslatedText style={[styles.title, { color: "#E67012" }]}>Your Privacy, Our Promise</TranslatedText>
          <TranslatedText style={[styles.paragraph, { color: colors.text }]}>
            Your safety and trust matter to us. E-Literacy is built with privacy at its core, ensuring that your personal information is always protected.
          </TranslatedText>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
         

          

          {privacyPoints.map((point, index) => (
            <View key={index} style={styles.point}>
              <FontAwesome6 name="check-circle" size={18} color={colors.primary} style={styles.pointIcon} />
              <TranslatedText style={[styles.pointText, { color: colors.text }]}>{point}</TranslatedText>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, marginTop: 20 }]}>
            <TranslatedText style={[styles.footer, { color: colors.muted }]}>
            At E-Literacy, privacy is not an afterthought — it’s part of how we help you grow confidently in the digital world.
            </TranslatedText>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20 }}
        >
          <LinearGradient
            colors={['#FF9800', '#FF6D00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButton}
          >
            <TranslatedText style={styles.actionText}>I Understand</TranslatedText>
          </LinearGradient>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600', // semi-bold
    textAlign: 'center',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#666', // Softer style
    marginBottom: 24,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pointIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  pointText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButton: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PrivacyScreen;
