import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import TranslatedText from '../../components/TranslatedText';
import { useTheme } from '../../components/ThemeContext';
import BottomTabBar from '../../components/BottomTabBar';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data - replace with actual data from your state management
const mockAssessments = [
  {
    id: 1,
    title: 'Digital Literacy Basics',
    courseTitle: 'Introduction to Digital Literacy',
    isCompleted: true,
    isLocked: false,
    duration: '40 min',
    questions: 25,
    credits: 2.5,
    imageUrl: 'https://i.pinimg.com/736x/c9/af/43/c9af431cdb9322e4ff4a43af70db96ae.jpg',
    type: 'digital',
    instructions: [
      'This assessment covers fundamental digital literacy concepts including computer basics, internet navigation, and file management.',
      'You will have 40 minutes to complete 25 mixed-format questions.',
      'A passing score of 70% or higher is required.',
      'Questions cover topics such as: operating systems, web browsers, search engines, and basic troubleshooting.',
      'Upon successful completion, you will receive a downloadable certificate of completion.'
    ],
  },
  {
    id: 2,
    title: 'Staying Safe Online',
    courseTitle: 'Online Safety and Security',
    isCompleted: true,
    isLocked: false,
    duration: '30 min',
    questions: 20,
    credits: 2.0,
    imageUrl: 'https://i.pinimg.com/1200x/fd/d3/8e/fdd38ec2967a3b43678794c61432b22b.jpg',
    type: 'safety',
    instructions: [
      'This assessment evaluates your knowledge of cybersecurity best practices and online safety protocols.',
      'You will have 30 minutes to answer 20 scenario-based questions.',
      'A minimum score of 75% is required to pass.',
      'Topics include: password security, phishing identification, social engineering, privacy settings, and safe browsing habits.',
      'Upon successful completion, you will receive a downloadable certificate of completion.'
    ],
  },
  {
    id: 3,
    title: 'Intro to Email & Messaging',
    courseTitle: 'Email and Communication',
    isCompleted: false,
    isLocked: false,
    duration: '35 min',
    questions: 20,
    credits: 1.5,
    imageUrl: 'https://i.pinimg.com/736x/cd/5d/40/cd5d400c39e3891914066593b96d610c.jpg',
    type: 'communication',
    instructions: [
      'This assessment tests your proficiency in email management and digital communication tools.',
      'Complete 20 practical questions within 35 minutes covering email etiquette and messaging platforms.',
      'You must achieve a score of 70% or above to pass this assessment.',
      'Assessment areas include: email composition, attachment handling, contact management, calendar integration, and professional communication standards.',
      'Upon successful completion, you will receive a downloadable certificate of completion.'
    ],
  },
  {
    id: 4,
    title: 'Content Creation Toolkit',
    courseTitle: 'Social Media and Content Creation',
    isCompleted: false,
    isLocked: false,
    duration: '45 min',
    questions: 30,
    credits: 3.0,
    imageUrl: 'https://i.pinimg.com/1200x/e5/b3/e3/e5b3e38520b4b0bc4d7a4b1d6b05605f.jpg',
    type: 'social',
    instructions: [
      'This comprehensive assessment covers social media management and digital content creation strategies.',
      'You have 45 minutes to complete 30 questions including multiple-choice and practical scenarios.',
      'A passing grade of 80% is required due to the advanced nature of this certification.',
      'Topics covered: content planning, visual design principles, platform-specific best practices, analytics interpretation, and audience engagement strategies.',
      'Upon successful completion, you will receive a downloadable certificate of completion.'
    ],
  },
  {
    id: 5,
    title: 'Digital Banking & Finance',
    courseTitle: 'Online Financial Services',
    isCompleted: false,
    isLocked: false,
    duration: '50 min',
    questions: 35,
    credits: 2.5,
    imageUrl: 'https://i.pinimg.com/736x/8b/c5/d4/8bc5d4f8e9a2b1c3d4e5f6a7b8c9d0e1.jpg',
    type: 'finance',
    instructions: [
      'This assessment evaluates your understanding of digital banking services and online financial management.',
      'Complete 35 questions within 50 minutes covering various aspects of digital financial literacy.',
      'A minimum score of 75% is required to demonstrate competency in digital financial services.',
      'Key areas include: online banking security, mobile payment systems, digital wallets, investment platforms, and fraud prevention.',
      'Upon successful completion, you will receive a downloadable certificate of completion.'
    ],
  },
  {
    id: 6,
    title: 'E-Government Services',
    courseTitle: 'Digital Citizenship and Government',
    isCompleted: false,
    isLocked: false,
    duration: '40 min',
    questions: 25,
    credits: 2.0,
    imageUrl: 'https://i.pinimg.com/736x/f2/a3/b4/f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7.jpg',
    type: 'government',
    instructions: [
      'This assessment covers the use of digital government services and online civic engagement.',
      'Answer 25 questions in 40 minutes about accessing and using e-government platforms.',
      'You need to score 70% or higher to pass.',
      'Topics include: online tax filing, digital ID verification, government portals navigation, voting systems, and public service access.',
      'Upon successful completion, you will receive a downloadable certificate of completion.'
    ],
  },
];

const TakeAssessmentsMenu = ({ navigation }) => {
  const { colors, isDark } = useTheme();

  const handleAssessmentPress = (assessment) => {
    if (!assessment.isLocked) {
      navigation.navigate('AssessmentInstructions', { assessment });
    }
  };

  const getAssessmentIcon = (type) => {
    switch (type) {
      case 'digital':
        return 'computer';
      case 'safety':
        return 'shield-halved';
      case 'communication':
        return 'envelope';
      case 'social':
        return 'users';
      case 'finance':
        return 'credit-card';
      case 'government':
        return 'landmark';
      default:
        return 'clipboard-check';
    }
  };

  const renderAssessmentCard = (assessment) => (
    <TouchableOpacity
      key={assessment.id}
      style={[
        styles.assessmentCard,
        {
          backgroundColor: isDark ? '#1e1e1eff' : '#f8f8f8' ,
          opacity: assessment.isLocked ? 0.6 : 1,
        },
      ]}
      onPress={() => handleAssessmentPress(assessment)}
      disabled={assessment.isLocked}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: assessment.imageUrl }}
          style={styles.assessmentImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <FontAwesome6
            name={assessment.isLocked ? 'lock' : getAssessmentIcon(assessment.type)}
            size={20}
            color="#fff"
          />
        </View>
        {assessment.isLocked && (
          <View style={styles.lockedOverlay}>
            <View style={styles.lockedBadge}>
              <Text style={styles.lockedText}>Locked</Text>
            </View>
          </View>
        )}
      </View>
      
      {/* Content Section */}
      <View style={styles.cardContent}>
        <View style={styles.assessmentInfo}>
          <Text style={[styles.assessmentTitle, { color: colors.text }]}>
            {assessment.title}
          </Text>
          <Text style={[styles.courseTitle, { color: colors.muted }]}>
            {assessment.courseTitle}
          </Text>
        </View>
        
        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <FontAwesome6 name="clock" size={14} color={colors.muted} />
            <Text style={[styles.detailText, { color: colors.muted }]}>
              {assessment.duration}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome6 name="clipboard" size={14} color={colors.muted} />
            <Text style={[styles.detailText, { color: colors.muted }]}>
              {assessment.questions} questions
            </Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome6 name="award" size={14} color={colors.muted} />
            <Text style={[styles.detailText, { color: colors.muted }]}>
              {assessment.credits} credits
            </Text>
          </View>
        </View>

        {!assessment.isLocked && (
          <View style={styles.startButton}>
             <LinearGradient
                colors={['#FF9800', '#FF6D00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 6 }]}
              />

            <Text style={styles.startButtonText}>Start Assessment</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <FontAwesome6 name="arrow-left" size={20} color="#E67012" />
        </TouchableOpacity>
        <TranslatedText style={styles.headerTitle}>Take Assessments</TranslatedText>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <FontAwesome6 name="lock" size={20} color="#E67012" />
          <TranslatedText style={[styles.infoText, { color: "#E67012" }]}>
            Complete courses to unlock their assessments
          </TranslatedText>
        </View>

        <View style={styles.assessmentsList}>
          {mockAssessments.map(renderAssessmentCard)}
        </View>
      </ScrollView>

      <BottomTabBar />
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
    paddingHorizontal: 20,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  assessmentsList: {
    paddingBottom: 100,
  },
  assessmentCard: {
    borderRadius: 12,
    marginBottom: 16,
     shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 15,
    
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  assessmentImage: {
    width: '100%',
    height: '100%',
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  lockedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.3,
    // shadowRadius: 22,
    // elevation: 15,
    
  },
  assessmentInfo: {
    marginBottom: 12,
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: 14,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 6,
    fontSize: 12,
  },
  startButton: {
    
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TakeAssessmentsMenu;