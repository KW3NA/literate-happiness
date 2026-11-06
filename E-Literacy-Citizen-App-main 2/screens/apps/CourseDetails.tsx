import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Dimensions, ImageBackground, ActivityIndicator } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { FontAwesome6 } from '@expo/vector-icons';
import { useLanguage } from '../../components/LanguageContext';
import TranslatedText from '../../components/TranslatedText';
import { supabase } from '../../config/supabase';
import { getCourseModules, getCourseVideo } from '../../config/courseContent';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'CourseDetails'>;

interface CourseDetailsProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  tags: string[];
  imageUrl: string;
  videoUrl?: string;
}

const CourseDetails: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useLanguage();
    const { courseId } = route.params;
  
  // Helper function to extract YouTube video ID
  const getYouTubeVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };
  
  const [courseData, setCourseData] = React.useState<CourseDetailsProps | null>(null);
  const [modules, setModules] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    async function fetchCourseDetails() {
      try {
        setLoading(true);
        // Query Supabase courses table with joined modules
        let query = supabase.from('courses').select('*, modules(*)');
        if (courseId.includes('-')) {
          query = query.eq('id', courseId);
        } else {
          query = query.or(`id.eq.${courseId},estimated_minutes.eq.${courseId}`);
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
          console.error('Supabase query error for course:', error);
        }

        if (data) {
          setCourseData({
            id: data.id,
            title: data.title,
            description: data.description || 'Master practical digital skills, safe internet practices, and job readiness tools.',
            duration: data.duration || `${data.estimated_minutes || 45} mins`,
            level: data.level || 'Beginner',
            tags: [data.level, (data.competency_area || '').replace(/_/g, ' ')].filter(Boolean),
            imageUrl: data.image_url || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
            videoUrl: data.video_url || '',
          });
          if (data.modules && data.modules.length > 0) {
            setModules(data.modules.sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0)));
          } else {
            setModules([]);
          }
        } else {
          setCourseData(null);
        }
      } catch (err) {
        console.error('Error fetching course details from Supabase:', err);
        setCourseData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchCourseDetails();
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('enrollments').upsert({
          user_id: user.id,
          course_id: courseId,
          progress: 5,
        }, { onConflict: 'user_id,course_id' });
      }
    } catch (e) {
      // ignore
    }
    navigation.navigate('ResumeCourse', { courseId });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <ImageBackground source={{ uri: courseData.imageUrl }} style={styles.imageContainer}>
        <View style={styles.imageOverlay} />
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text>
              <FontAwesome6 name="arrow-left" size={20} color="#fff" />
            </Text>
          </TouchableOpacity>
          <TranslatedText style={styles.courseTitle}>{courseData.title}</TranslatedText>
        </View>
      </ImageBackground>
    </View>
  );

  const renderDescription = () => (
    <View style={styles.section}>
      <TranslatedText style={styles.sectionTitle}>Description</TranslatedText>
      <TranslatedText style={styles.descriptionText}>{courseData.description}</TranslatedText>
    </View>
  );

  const renderVideoContainer = () => {
    const videoId = getYouTubeVideoId(courseData.videoUrl || '');
    return (
      <View style={styles.section}>
        <TranslatedText style={styles.sectionTitle}>Course Preview</TranslatedText>
        <View style={styles.videoContainer}>
          {videoId ? (
            <View style={styles.videoWrapper}>
              <YoutubePlayer
                height={220}
                play={false}
                videoId={videoId}
              />
            </View>
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text>
                <FontAwesome6 name="exclamation-triangle" size={40} color="#ff6b6b" />
              </Text>
              <TranslatedText style={styles.videoPlaceholderText}>Invalid video URL</TranslatedText>
              <TranslatedText style={styles.videoNote}>Please check the video URL configuration</TranslatedText>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderCourseDetails = () => (
    <View style={styles.section}>
      <TranslatedText style={styles.sectionTitle}>Course Details</TranslatedText>
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text>
            <FontAwesome6 name="clock" size={16} color="#E67012" />
          </Text>
          <TranslatedText style={styles.detailLabel}>Duration:</TranslatedText>
          <Text style={styles.detailValue}>{courseData.duration}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text>
            <FontAwesome6 name="signal" size={16} color="#E67012" />
          </Text>
          <TranslatedText style={styles.detailLabel}>Level:</TranslatedText>
          <Text style={styles.detailValue}>{courseData.level}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text>
            <FontAwesome6 name="tags" size={16} color="#E67012" />
          </Text>
          <TranslatedText style={styles.detailLabel}>Tags:</TranslatedText>
          <View style={styles.tagsContainer}>
            {courseData.tags.map((tag, index) => (
              <View key={index} style={styles.tagItem}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderCurriculum = () => (
    <View style={styles.section}>
      <TranslatedText style={styles.sectionTitle}>Course Curriculum & Assessments</TranslatedText>
      {modules.length > 0 ? (
        modules.map((m, idx) => (
          <View key={m.id || idx} style={{ marginBottom: 12, padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#E67012', flex: 1 }}>
                {`Module ${m.order_num || idx + 1}: ${m.title}`}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>{`${m.estimated_minutes || 15} mins`}</Text>
            </View>
            {(m.blocks || []).map((b: any, bIdx: number) => (
              <View key={bIdx} style={{ marginTop: 4 }}>
                {b.type === 'heading' && <Text style={{ fontWeight: '600', fontSize: 13, color: '#374151' }}>{b.content}</Text>}
                {b.type === 'paragraph' && <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{b.content}</Text>}
              </View>
            ))}
            {m.quiz && m.quiz.questions && m.quiz.questions.length > 0 && (
              <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome6 name="clipboard-check" size={13} color="#16a34a" />
                <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '500', marginLeft: 6 }}>
                  {`Includes ${m.quiz.questions.length} quiz assessment questions`}
                </Text>
              </View>
            )}
          </View>
        ))
      ) : (
        <TranslatedText style={{ color: '#6b7280', fontSize: 14 }}>
          Comprehensive learning modules and interactive assessments are ready for this course.
        </TranslatedText>
      )}
    </View>
  );

  const renderEnrollButton = () => (
    <View style={styles.enrollSection}>
      <TouchableOpacity style={styles.enrollButton} onPress={handleEnroll}>
        <LinearGradient
          colors={['#FF9800', '#FF6D00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
        />
        <TranslatedText style={styles.enrollButtonText}>Enroll Now</TranslatedText>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#E67012" />
        <TranslatedText style={{ marginTop: 12, color: '#666', fontSize: 16 }}>Loading course details...</TranslatedText>
      </SafeAreaView>
    );
  }

  if (!courseData) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <FontAwesome6 name="triangle-exclamation" size={48} color="#E67012" />
        <TranslatedText style={{ fontSize: 20, fontWeight: 'bold', marginTop: 16, color: '#333' }}>Course Not Found</TranslatedText>
        <TranslatedText style={{ fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
          The requested course is currently unavailable or has not been approved yet.
        </TranslatedText>
        <TouchableOpacity style={styles.enrollButton} onPress={() => navigation.goBack()}>
          <TranslatedText style={styles.enrollButtonText}>Back to Learning Hub</TranslatedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderDescription()}
        {renderVideoContainer()}
        {renderCourseDetails()}
        {renderCurriculum()}
        {renderEnrollButton()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    bottom: 10,
  },
  headerContainer: {
    height: 250,
    position: 'relative',
    bottom: 10,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#E67012',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  videoPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  videoPlaceholderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  videoNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  videoWrapper: {
    height: 200,
  },
  videoPlayer: {
    flex: 1,
  },
  videoUrl: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  detailsContainer: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 60,
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  tagItem: {
    backgroundColor: 'rgba(230, 112, 18, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(230, 112, 18, 0.3)',
  },
  tagText: {
    fontSize: 14,
    color: '#E67012',
    fontWeight: '500',
  },
  enrollSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
  },
  enrollButton: {
    backgroundColor: '#E67012',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#E67012',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  enrollButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default CourseDetails; 