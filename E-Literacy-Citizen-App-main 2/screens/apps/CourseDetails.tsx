import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Dimensions, ImageBackground } from 'react-native';
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
  
  // Course data mapping - all available courses
  const allCourses: { [key: string]: CourseDetailsProps } = {
    '4': {
      id: '4',
      title: 'Digital Basics 101',
      description: 'Master the fundamentals of digital technology in this comprehensive beginner course. Learn essential computer skills, internet navigation, and basic software applications. Perfect for those new to technology or looking to refresh their digital knowledge.',
      duration: '45 mins',
      level: 'Beginner',
      tags: ['Devices', 'Internet', 'Basics'],
      imageUrl: 'https://i.pinimg.com/736x/c9/af/43/c9af431cdb9322e4ff4a43af70db96ae.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=Z1XJFdHlos4',
    },
    '5': {
      id: '5',
      title: 'Click with Confidence',
      description: 'Learn to navigate the web with confidence. Master mouse and keyboard skills, understand web browsers, and discover how to find information online safely and efficiently.',
      duration: '30 mins',
      level: 'Beginner',
      tags: ['Web', 'Navigation', 'Browsing'],
      imageUrl: 'https://i.pinimg.com/1200x/5c/04/4d/5c044dfa3ddd5ef809f1c8e473d9bf35.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=7lpqqmgeLNg',
    },
    '6': {
      id: '6',
      title: 'Staying Safe Online',
      description: 'Protect yourself in the digital world. Learn about online privacy, password security, recognizing scams, and best practices for staying safe on the internet.',
      duration: '35 mins',
      level: 'Beginner',
      tags: ['Safety', 'Privacy', 'Security'],
      imageUrl: 'https://i.pinimg.com/1200x/fd/d3/8e/fdd38ec2967a3b43678794c61432b22b.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=SUOc3n06wIA',
    },
    '7': {
      id: '7',
      title: 'Everyday Tech',
      description: 'Master your smartphone and mobile devices. Learn to take photos, make calls, send messages, and use apps effectively for daily tasks.',
      duration: '40 mins',
      level: 'Beginner',
      tags: ['Mobile', 'Photos', 'Apps'],
      imageUrl: 'https://i.pinimg.com/736x/57/7d/5b/577d5bb2029524c0070fbf4307114666.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=fEkXavRkzlQ',
    },
    '8': {
      id: '8',
      title: 'Intro to Email & Messaging',
      description: 'Communicate effectively online. Learn to send emails, use messaging apps, organize your inbox, and maintain professional communication.',
      duration: '30 mins',
      level: 'Beginner',
      tags: ['Email', 'Chat', 'Communication'],
      imageUrl: 'https://i.pinimg.com/736x/cd/5d/40/cd5d400c39e3891914066593b96d610c.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=a5uT85i9zQU',
    },
    '9': {
      id: '9',
      title: 'Smart Skills: Working with Tools',
      description: 'Boost your productivity with digital tools. Master word processing, spreadsheets, presentations, and collaboration software for work and personal projects.',
      duration: '60 mins',
      level: 'Intermediate',
      tags: ['Productivity', 'Docs', 'Office'],
      imageUrl: 'https://platform.theverge.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/24102584/m365app.jpg?quality=90&strip=all&crop=0,0.24875621890547,100,99.502487562189',
        videoUrl: 'https://www.youtube.com/watch?v=DGDC954-AO8',
    },
    '10': {
      id: '10',
      title: 'Online Job Search Essentials',
      description: 'Navigate the digital job market successfully. Learn to create professional profiles, search for opportunities, and apply for jobs online effectively.',
      duration: '45 mins',
      level: 'Intermediate',
      tags: ['Career', 'CV', 'Job Search'],
      imageUrl: 'https://www.flexjobs.com/blog/wp-content/uploads/2021/09/10045333/Job-Searching-Online-11-Best-Practices-You-Need-to-Know-2-2.jpg?w=1024',
        videoUrl: 'https://www.youtube.com/watch?v=l_C5s4JQHZ4',
    },
    '11': {
      id: '11',
      title: 'Digital Communication at Work',
      description: 'Excel in professional digital communication. Master email etiquette, video conferencing, team collaboration tools, and remote work best practices.',
      duration: '50 mins',
      level: 'Intermediate',
      tags: ['Email', 'Meetings', 'Collaboration'],
      imageUrl: 'https://i.pinimg.com/1200x/13/f4/d0/13f4d04f47eac56d27d4b9678f86ff6a.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=esOIt3-9vlA',
    },
    '12': {
      id: '12',
      title: 'Manage Your Digital Identity',
      description: 'Build and protect your online presence. Learn about personal branding, social media management, reputation building, and digital footprint awareness.',
      duration: '40 mins',
      level: 'Intermediate',
      tags: ['Branding', 'Safety', 'Social Media'],
      imageUrl: 'https://www.globalsign.com/application/files/6917/1496/1818/digital-identity-hero-image.webp',
        videoUrl: 'https://www.youtube.com/watch?v=VGETWcjoAUU',
    },
    '13': {
      id: '13',
      title: 'Intro to Cloud Tools',
      description: 'Harness the power of cloud computing. Learn to use cloud storage, backup solutions, online collaboration tools, and work from anywhere.',
      duration: '35 mins',
      level: 'Intermediate',
      tags: ['Cloud', 'Storage', 'Backup'],
      imageUrl: 'https://i.pinimg.com/1200x/85/1b/74/851b74e4e5e8f285409f567c86a377dc.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=RVMYtnYV4Ds',
    },
    '14': {
      id: '14',
      title: 'Tech for Entrepreneurs',
      description: 'Leverage technology to grow your business. Discover digital marketing tools, e-commerce platforms, business automation, and online business strategies.',
      duration: '60 mins',
      level: 'Advanced',
      tags: ['Business', 'Tools', 'Marketing'],
      imageUrl: 'https://i.pinimg.com/736x/2e/6d/82/2e6d82123a4ef5422984ea07fa6ad0cd.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=wpDi7B_NmQ0',
    },
    '15': {
      id: '15',
      title: 'Cybersecurity Basics',
      description: 'Protect yourself and your data from digital threats. Learn about malware, phishing, data protection, and cybersecurity best practices for personal and professional use.',
      duration: '55 mins',
      level: 'Advanced',
      tags: ['Security', 'Threats', 'Protection'],
      imageUrl: 'https://i.pinimg.com/736x/0b/8a/48/0b8a48d4343a1eb1fd9581e1048f2f45.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=nIoXdkEBl4M',
    },
    '16': {
      id: '16',
      title: 'Data Skills for Decision-Making',
      description: 'Transform data into insights. Learn to analyze information, create charts and graphs, interpret statistics, and make data-driven decisions in your personal and professional life.',
      duration: '75 mins',
      level: 'Advanced',
      tags: ['Analysis', 'Insights', 'Data'],
      imageUrl: 'https://i.pinimg.com/736x/2b/a2/9c/2ba29c620e03944902f182e748aa8abd.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
    },
    '17': {
      id: '17',
      title: 'Content Creation Toolkit',
      description: 'Create compelling digital content. Master graphic design basics, video editing, social media content creation, and storytelling for the digital age.',
      duration: '60 mins',
      level: 'Advanced',
      tags: ['Design', 'Editing', 'Creativity'],
      imageUrl: 'https://i.pinimg.com/1200x/e5/b3/e3/e5b3e38520b4b0bc4d7a4b1d6b05605f.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=ZZkgC9BHy00',
    },
    '18': {
      id: '18',
      title: 'AI & the Future of Work',
      description: 'Understand artificial intelligence and its impact on the workplace. Learn about AI tools, automation trends, and how to adapt to the changing digital landscape.',
      duration: '50 mins',
      level: 'Advanced',
      tags: ['AI', 'Jobs', 'Automation'],
      imageUrl: 'https://i.pinimg.com/1200x/63/83/86/638386035baa03f7b2132090383ea92d.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=fEkXavRkzlQ',
    },
  };

  // Course data state loaded from allCourses or live Supabase
  const [courseData, setCourseData] = React.useState<CourseDetailsProps>(
    allCourses[courseId] || {
      id: courseId,
      title: 'Digital Skills Course',
      description: 'Master practical digital skills, safe internet practices, and job readiness tools.',
      duration: '45 mins',
      level: 'Beginner',
      tags: ['Digital Skills', 'Certification'],
      imageUrl: 'https://i.pinimg.com/736x/c9/af/43/c9af431cdb9322e4ff4a43af70db96ae.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=wod8gUBxWR4',
    }
  );
  // Start with built-in content so the curriculum is never empty;
  // Supabase data (if present) overrides it below.
  const [modules, setModules] = React.useState<any[]>(getCourseModules(courseId));

  React.useEffect(() => {
    async function fetchCourseDetails() {
      try {
        const { data: c } = await supabase
          .from('courses')
          .select('*, modules(*)')
          .eq('id', courseId)
          .single();

        if (c) {
          setCourseData({
            id: c.id,
            title: c.title,
            description: c.description || 'Master practical digital skills and assessments.',
            duration: c.duration || `${c.estimated_minutes || 45} mins`,
            level: c.level || 'Beginner',
            tags: [c.level, (c.competency_area || '').replace(/_/g, ' '), 'Certification'].filter(Boolean),
            imageUrl: c.image_url || 'https://i.pinimg.com/736x/c9/af/43/c9af431cdb9322e4ff4a43af70db96ae.jpg',
            videoUrl: c.video_url || getCourseVideo(c.id, 0).url,
          });
          if (c.modules && c.modules.length > 0) {
            setModules(c.modules.sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0)));
          } else {
            // No DB content — keep the built-in curriculum for this course.
            setModules(getCourseModules(courseId));
          }
        }
      } catch (err) {
        console.log('Error fetching course details from Supabase:', err);
        // Offline / no row: fall back to built-in content.
        setModules(getCourseModules(courseId));
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