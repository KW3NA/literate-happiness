import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../components/ThemeContext';
import TranslatedText from '../../components/TranslatedText';
import {LinearGradient} from 'expo-linear-gradient';
import { getCourseQuizQuestions } from '../../config/courseContent';

const QuizInstructions = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const { courseId } = route.params || {};
  // Actual number of questions the learner will face for this course.
  const questionCount = getCourseQuizQuestions(courseId ?? '').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color={colors.primary} style={{ marginLeft: 15 }} />
        </TouchableOpacity>
        <TranslatedText style={[styles.headerTitle, { color: colors.primary }]}>
          Quiz Instructions
        </TranslatedText>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconContainer}>
          <FontAwesome5 name="clipboard-list" size={60} color={colors.primary} />
        </View>

        <TranslatedText style={[styles.title, { color: colors.text }]}>
          Digital Safety Assessment
        </TranslatedText>

        <TranslatedText style={[styles.overview, { color: colors.muted }]}>
          Test your knowledge of digital safety and cybersecurity best practices. This quiz covers essential topics including password security, safe browsing, email safety, and protecting personal information online.
        </TranslatedText>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <FontAwesome5 name="clock" size={20} color={colors.primary} />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              15 minutes time limit
            </TranslatedText>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome5 name="question-circle" size={20} color={colors.primary} />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              {questionCount > 0 ? `${questionCount} questions across all modules — take your time` : 'Multiple choice questions'}
            </TranslatedText>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome5 name="trophy" size={20} color={colors.primary} />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              Score will be calculated at the end
            </TranslatedText>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome5 name="video" size={20} color="#FF5252" />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              This quiz is PROCTORED — camera and microphone are mandatory. You cannot answer without an active camera session.
            </TranslatedText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.85}
          onPress={() => {
            // Hand off to the Quiz screen — it wraps itself in ProctorGate,
            // which requests camera/mic permissions and only reveals the
            // questions once the proctor session is live. No dead-end screens.
            navigation.navigate('Quiz', { courseId, proctored: true });
          }}
        >
          <LinearGradient
            colors={['#FF9800', '#FF6D00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
          />
          <TranslatedText style={styles.startButtonText}>Start Quiz</TranslatedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 100,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  infoContainer: {
    marginBottom: 32,
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  infoText: {
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  startButton: {
    width: '90%',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    overflow: 'hidden',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default QuizInstructions;