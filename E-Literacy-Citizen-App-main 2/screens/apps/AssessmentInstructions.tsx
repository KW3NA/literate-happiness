import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '../../components/ThemeContext';
import TranslatedText from '../../components/TranslatedText';
import { LinearGradient } from 'expo-linear-gradient';

const AssessmentInstructions = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const assessment = route?.params?.assessment;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left" size={20} color={colors.primary} style={{ marginLeft: 18 }} />
        </TouchableOpacity>
        <TranslatedText style={[styles.headerTitle, { color: colors.primary }]}>
          Assessment Instructions
        </TranslatedText>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconContainer}>
          <FontAwesome6 name="clipboard-check" size={60} color={colors.primary} />
        </View>

        <TranslatedText style={[styles.title, { color: colors.text }]}>
          {assessment?.title || 'Assessment'}
        </TranslatedText>

        <TranslatedText style={[styles.overview, { color: colors.muted }]}>
          Test your knowledge and skills in this comprehensive assessment. Read each question carefully and select the best answer. Your performance will help evaluate your current skill level.
        </TranslatedText>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <FontAwesome6 name="clock" size={20} color={colors.primary} />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              {assessment?.duration || '30 minutes'} time limit
            </TranslatedText>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome6 name="clipboard" size={20} color={colors.primary} />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              {assessment?.questions || 25} multiple choice questions
            </TranslatedText>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome6 name="trophy" size={20} color={colors.primary} />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              Score will be calculated at the end
            </TranslatedText>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome6 name="star" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              Get an average of 80% to receive your certificate of completion.
            </TranslatedText>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome6 name="video" size={20} color="#FF5252" />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              This assessment is PROCTORED — your camera and microphone must stay ON for the entire test. You cannot answer any question without an active camera session.
            </TranslatedText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.85}
          onPress={() => {
            // Hand off to the Assessment screen — it wraps itself in ProctorGate,
            // which requests camera/mic permissions and only reveals the questions
            // once the proctor session is live. No intermediate dead-end screens.
            navigation.navigate('Assessment', { assessment, proctored: true });
          }}
        >
          <LinearGradient
            colors={['#FF9800', '#FF6D00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
          />
          <TranslatedText style={styles.startButtonText}>Start Assessment</TranslatedText>
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
    marginRight: 80,
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
    paddingHorizontal: 10,
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

export default AssessmentInstructions;