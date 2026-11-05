import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import TranslatedText from '../../components/TranslatedText';
import { useTheme } from '../../components/ThemeContext';
import { useUser } from '../../components/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { downloadAndShareCertificate } from '../../utils/certificateGenerator';

const AssessmentResults = ({ route, navigation }) => {
  const { assessment, answers, questions } = route.params;
  const { colors, isDark } = useTheme();
  const { user } = useUser();

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      const userAnswer = answers[question.id];
      
      switch (question.type) {
        case 'multiple_choice':
          if (userAnswer === question.correctAnswer) correct++;
          break;
        case 'true_false':
          if (userAnswer === question.correctAnswer) correct++;
          break;
        case 'fill_blank':
          if (userAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase()) correct++;
          break;
      }
    });
    
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100)
    };
  };

  const score = calculateScore();
  const passed = score.percentage >= 70; // Assuming 70% is passing

  const getScoreColor = () => {
    if (score.percentage >= 80) return '#4CAF50';
    if (score.percentage >= 70) return '#FF9800';
    return '#F44336';
  };

  const handleDownloadCertificate = async () => {
    const score = calculateScore();
    
    // Only allow certificate download if passed (80% or higher)
    if (score.percentage < 80) {
      alert('You need at least 80% to download your certificate. Please retake the assessment.');
      return;
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const userName = user?.name || user?.email || 'Student';

    await downloadAndShareCertificate({
      userName: userName,
      courseName: assessment.title,
      completionDate: currentDate,
      instructorName: 'Digital Literacy Instructor',
      directorName: 'E-Literacy Program Director',
    });
  };

  const handleRetakeAssessment = () => {
    navigation.navigate('AssessmentScreen', { assessment });
  };

  const handleBackToMenu = () => {
    navigation.navigate('TakeAssessmentsMenu');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.resultIcon, { backgroundColor: getScoreColor() }]}>
            <FontAwesome6 
              name={passed ? 'trophy' : 'xmark'} 
              size={40} 
              color="white" 
            />
          </View>
          <TranslatedText style={[styles.resultTitle, { color: colors.text }]}>
            {passed ? 'Congratulations!' : 'Assessment Complete'}
          </TranslatedText>
          <TranslatedText style={[styles.resultSubtitle, { color: colors.muted }]}>
            {assessment.title}
          </TranslatedText>
        </View>

        {/* Score Card */}
        <View style={[styles.scoreCard, { backgroundColor: isDark ? "#1e1e1eff" : colors.card }]}>
          <View style={styles.scoreHeader}>
            <TranslatedText style={[styles.scoreLabel, { color: colors.text }]}>Your Score</TranslatedText>
          </View>
          
          <View style={styles.scoreDisplay}>
            <Text style={[styles.scorePercentage, { color: getScoreColor() }]}>
              {score.percentage}%
            </Text>
            <TranslatedText style={[styles.scoreDetails, { color: colors.muted }]}>
              {score.correct} out of {score.total} correct
            </TranslatedText>
          </View>

          <View style={styles.scoreBar}>
            <View style={[styles.scoreBarFill, { 
              width: `${score.percentage}%`, 
              backgroundColor: getScoreColor() 
            }]} />
          </View>

          <TranslatedText style={[styles.scoreStatus, { color: getScoreColor() }]}>
            {passed ? '✓ Passed' : '✗ Did not pass'}
          </TranslatedText>
        </View>

        {/* Assessment Details */}
        <View style={[styles.detailsCard, { backgroundColor: isDark ? "#1e1e1eff" : colors.card }]}>
          <TranslatedText style={[styles.detailsTitle, { color: colors.text }]}>
            Assessment Details
          </TranslatedText>

          <View style={styles.detailRow}>
            <FontAwesome6 name="clock" size={16} color={colors.muted} />
            <TranslatedText style={[styles.detailText, { color: colors.muted }]}>
              Duration: {assessment.duration}
            </TranslatedText>
          </View>
          
          <View style={styles.detailRow}>
            <FontAwesome6 name="clipboard" size={16} color={colors.muted} />
            <TranslatedText style={[styles.detailText, { color: colors.muted }]}>
              Questions: {assessment.questions}
            </TranslatedText>
          </View>
          
          <View style={styles.detailRow}>
            <FontAwesome6 name="award" size={16} color={colors.muted} />
            <TranslatedText style={[styles.detailText, { color: colors.muted }]}>
              Credits: {assessment.credits}
            </TranslatedText>
          </View>
        </View>

        {/* Certificate Section */}
        {passed && (
          <View style={[styles.certificateCard, { backgroundColor: isDark ? "#1e1e1eff" : colors.card }]}>
            <View style={styles.certificateIcon}>
              <FontAwesome6 name="certificate" size={30} color="#E67012" />
            </View>
            <TranslatedText style={[styles.certificateTitle, { color: colors.text }]}>
              Certificate Available
            </TranslatedText>
            <TranslatedText style={[styles.certificateText, { color: colors.muted }]}>
              You have successfully completed this assessment and earned your certificate of completion.
            </TranslatedText>
            
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={handleDownloadCertificate}
            >
              <LinearGradient
                colors={['#1DACFF', '#1E90FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.downloadGradient}
              >
                 
                <FontAwesome6 name="download" size={16} color="white" />
                <TranslatedText style={styles.downloadButtonText}>Download Certificate</TranslatedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!passed && (
            <TouchableOpacity 
              style={styles.retakeButton}
              onPress={handleRetakeAssessment}
            >
              <LinearGradient
                colors={['#FF9800', '#FF6D00']}
                style={styles.retakeGradient}
              >
                <FontAwesome6 name="rotate-right" size={16} color="white" />
                <TranslatedText style={styles.retakeButtonText}>Retake Assessment</TranslatedText>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.backButton]}
            onPress={handleBackToMenu}
          >
            <LinearGradient
                            colors={['#FF9800', '#FF6D00']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[StyleSheet.absoluteFill, { borderRadius: 6 }]}
                          />
            <TranslatedText style={[styles.backButtonText, { color: "white" }]}>
              Back to Assessments
            </TranslatedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  scoreCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreDetails: {
    fontSize: 16,
    marginTop: 8,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  scoreBarFill: {
    height: '100%',
  },
  scoreStatus: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailsCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 16,
  },
  certificateCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  certificateIcon: {
    marginBottom: 16,
  },
  certificateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  certificateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  downloadButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  downloadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionButtons: {
    paddingBottom: 40,
  },
  retakeButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  retakeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  backButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AssessmentResults;