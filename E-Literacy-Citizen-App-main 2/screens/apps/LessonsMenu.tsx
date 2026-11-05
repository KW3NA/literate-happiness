import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import BottomTabBar from '../../components/BottomTabBar';
import TranslatedText from '../../components/TranslatedText';
import CourseCard from '../../components/CourseCard';
import { useTheme } from '../../components/ThemeContext';
import AvailableCourseCard from '../../components/AvailableCourseCard';
import { LinearGradient } from 'expo-linear-gradient';
import { getCourseVideo } from '../../config/courseContent';
import { supabase } from '../../config/supabase';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Learn'>;

// Course data
const courseCategories = ['All Courses', 'Beginner', 'Intermediate', 'Advanced', 'Digital Skills', 'Career'];

const initialInProgressCourses = [
  {
    id: 1,
    title: 'Digital Basics 101',
    progress: 75,
    type: 'coding' as const,
    imageUrl: 'https://i.pinimg.com/736x/c9/af/43/c9af431cdb9322e4ff4a43af70db96ae.jpg',
  },
  {
    id: 2,
    title: 'Staying Safe Online',
    progress: 45,
    type: 'ai' as const,
    imageUrl: 'https://i.pinimg.com/1200x/fd/d3/8e/fdd38ec2967a3b43678794c61432b22b.jpg',
  },
  {
    id: 3,
    title: 'Smart Skills: Working with Tools',
    progress: 60,
    type: 'ml' as const,
    imageUrl: 'https://platform.theverge.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/24102584/m365app.jpg?quality=90&strip=all&crop=0,0.24875621890547,100,99.502487562189',
  },
   {
    id: 4,
    title: 'Create a CV that Stands Out',
    progress: 15,
    type: 'coding' as const,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSo94aOlDKPw6XtMFWsno0zeO5bQhmhYuN0PA&s',
  },
];

const initialAvailableCourses = [
  // Beginner Courses
  {
    id: 4,
    title: 'Digital Basics 101',
    type: 'coding' as const,
    duration: '45 mins',
    level: 'Beginner',
    tags: 'Devices • Internet',
    icon: 'desktop',
    imageUrl: 'https://i.pinimg.com/736x/c9/af/43/c9af431cdb9322e4ff4a43af70db96ae.jpg',
  },
  {
    id: 5,
    title: 'Click with Confidence',
    type: 'coding' as const,
    duration: '30 mins',
    level: 'Beginner',
    tags: 'Web • Navigation',
    icon: 'arrow-pointer',
    imageUrl: 'https://i.pinimg.com/1200x/5c/04/4d/5c044dfa3ddd5ef809f1c8e473d9bf35.jpg',
  },
  {
    id: 6,
    title: 'Staying Safe Online',
    type: 'ai' as const,
    duration: '35 mins',
    level: 'Beginner',
    tags: 'Safety • Privacy',
    icon: 'shield-halved',
    imageUrl: 'https://i.pinimg.com/1200x/fd/d3/8e/fdd38ec2967a3b43678794c61432b22b.jpg',
  },
  {
    id: 7,
    title: 'Everyday Tech',
    type: 'coding' as const,
    duration: '40 mins',
    level: 'Beginner',
    tags: 'Mobile • Photos',
    icon: 'mobile-screen',
    imageUrl: 'https://i.pinimg.com/736x/57/7d/5b/577d5bb2029524c0070fbf4307114666.jpg',
  },
  {
    id: 8,
    title: 'Intro to Email & Messaging',
    type: 'coding' as const,
    duration: '30 mins',
    level: 'Beginner',
    tags: 'Email • Chat',
    icon: 'envelope',
    imageUrl: 'https://i.pinimg.com/736x/cd/5d/40/cd5d400c39e3891914066593b96d610c.jpg',
  },
  // Intermediate Courses
  {
    id: 9,
    title: 'Smart Skills: Working with Tools',
    type: 'ml' as const,
    duration: '60 mins',
    level: 'Intermediate',
    tags: 'Productivity • Docs',
    icon: 'wrench',
    imageUrl: 'https://platform.theverge.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/24102584/m365app.jpg?quality=90&strip=all&crop=0,0.24875621890547,100,99.502487562189',
  },
  {
    id: 10,
    title: 'Online Job Search Essentials',
    type: 'ml' as const,
    duration: '45 mins',
    level: 'Intermediate',
    tags: 'Career • CV',
    icon: 'briefcase',
    imageUrl: 'https://www.flexjobs.com/blog/wp-content/uploads/2021/09/10045333/Job-Searching-Online-11-Best-Practices-You-Need-to-Know-2-2.jpg?w=1024',
  },
  {
    id: 11,
    title: 'Digital Communication at Work',
    type: 'coding' as const,
    duration: '50 mins',
    level: 'Intermediate',
    tags: 'Email • Meetings',
    icon: 'users',
    imageUrl: 'https://i.pinimg.com/1200x/13/f4/d0/13f4d04f47eac56d27d4b9678f86ff6a.jpg',
  },
  {
    id: 12,
    title: 'Manage Your Digital Identity',
    type: 'ai' as const,
    duration: '40 mins',
    level: 'Intermediate',
    tags: 'Branding • Safety',
    icon: 'user-shield',
    imageUrl: 'https://www.globalsign.com/application/files/6917/1496/1818/digital-identity-hero-image.webp',
  },
  {
    id: 13,
    title: 'Intro to Cloud Tools',
    type: 'coding' as const,
    duration: '35 mins',
    level: 'Intermediate',
    tags: 'Cloud • Storage',
    icon: 'cloud',
    imageUrl: 'https://i.pinimg.com/1200x/85/1b/74/851b74e4e5e8f285409f567c86a377dc.jpg',
  },
  // Advanced Courses
  {
    id: 14,
    title: 'Tech for Entrepreneurs',
    type: 'ai' as const,
    duration: '60 mins',
    level: 'Advanced',
    tags: 'Business • Tools',
    icon: 'rocket',
    imageUrl: 'https://i.pinimg.com/736x/2e/6d/82/2e6d82123a4ef5422984ea07fa6ad0cd.jpg',
  },
  {
    id: 15,
    title: 'Cybersecurity Basics',
    type: 'ai' as const,
    duration: '55 mins',
    level: 'Advanced',
    tags: 'Security • Threats',
    icon: 'shield',
    imageUrl: 'https://i.pinimg.com/736x/0b/8a/48/0b8a48d4343a1eb1fd9581e1048f2f45.jpg',
  },
  {
    id: 16,
    title: 'Data Skills for Decision-Making',
    type: 'ml' as const,
    duration: '75 mins',
    level: 'Advanced',
    tags: 'Analysis • Insights',
    icon: 'chart-line',
    imageUrl: 'https://i.pinimg.com/736x/2b/a2/9c/2ba29c620e03944902f182e748aa8abd.jpg',
  },
  {
    id: 17,
    title: 'Content Creation Toolkit',
    type: 'coding' as const,
    duration: '60 mins',
    level: 'Advanced',
    tags: 'Design • Editing',
    icon: 'video',
    imageUrl: 'https://i.pinimg.com/1200x/e5/b3/e3/e5b3e38520b4b0bc4d7a4b1d6b05605f.jpg',
  },
  {
    id: 18,
    title: 'AI & the Future of Work',
    type: 'ai' as const,
    duration: '50 mins',
    level: 'Advanced',
    tags: 'AI • Jobs',
    icon: 'robot',
    imageUrl: 'https://i.pinimg.com/1200x/63/83/86/638386035baa03f7b2132090383ea92d.jpg',
  },
];

const progressStats = {
  totalCourses: 28,
  inProgress: 3,
  completed: 1,
};

function LessonsMenu({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('All Courses');
  const [inProgressCourses, setInProgressCourses] = useState(initialInProgressCourses);
  const [availableCourses, setAvailableCourses] = useState(initialAvailableCourses);

  useEffect(() => {
    async function loadSupabaseData() {
      try {
        const { data: dbCourses } = await supabase
          .from('courses')
          .select('*')
          .eq('status', 'approved')
          .eq('is_published', true);

        if (dbCourses && dbCourses.length > 0) {
          const mapped = dbCourses.map((c: any) => ({
            id: c.id,
            title: c.title,
            type: (c.competency_area === 'using_devices' ? 'coding' : (c.competency_area === 'staying_safe' ? 'ai' : 'ml')) as any,
            duration: c.duration || `${c.estimated_minutes || 30} mins`,
            level: c.level,
            tags: `${c.level} • ${(c.competency_area || 'digital').replace(/_/g, ' ')}`,
            icon: c.competency_area === 'using_devices' ? 'desktop' : 'shield-halved',
            imageUrl: c.image_url || 'https://i.pinimg.com/736x/c9/af/43/c9af431cdb9322e4ff4a43af70db96ae.jpg',
            videoUrl: c.video_url || getCourseVideo(c.id, 0).url,
          }));
          setAvailableCourses(mapped);
        }

        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('*, courses(*)');

        if (enrollments && enrollments.length > 0) {
          const inProgress = enrollments.map((e: any) => ({
            id: e.course_id || e.id,
            title: e.courses?.title || 'Course In Progress',
            progress: e.progress || 25,
            type: 'coding' as any,
            imageUrl: e.courses?.image_url || 'https://i.pinimg.com/736x/c9/af/43/c9af431cdb9322e4ff4a43af70db96ae.jpg',
          }));
          setInProgressCourses(inProgress);
        }
      } catch (e) {
        console.log('Error loading courses from Supabase:', e);
      }
    }
    loadSupabaseData();
  }, []);

  const { colors, isDark } = useTheme();

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.card }] }>
      <View style={styles.headerLeft}>
                 <TouchableOpacity 
           style={styles.backButton} 
           onPress={() => navigation.goBack()}
         >
           <Text>
             <FontAwesome6 name="arrow-left" size={20} color="#E67012" />
           </Text>
         </TouchableOpacity>
        <TranslatedText style={styles.headerTitle}>Learning Hub</TranslatedText>
      </View>
             <View style={styles.headerIcons}>
         <TouchableOpacity style={styles.iconButton}>
           <Text>
             <FontAwesome6 name="magnifying-glass" size={20} color={isDark ? '#fff' : '#000'} />
           </Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.iconButton}>
           <Text>
             <FontAwesome6 name="bell" size={20} color={isDark ? '#fff' : '#000'} />
           </Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.iconButton}>
           <Text>
             <FontAwesome6 name="user" size={20} color={isDark ? '#fff' : '#000'} />
           </Text>
         </TouchableOpacity>
       </View>
    </View>
  );

  const renderCategoryFilters = () => (
    <View style={styles.categoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {courseCategories.map((category) => {
          const active = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={{ marginRight: 10 }}
            >
              {active ? (
                <LinearGradient
                  colors={[ '#FF9800', '#FF6D00' ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.categoryButton, { paddingHorizontal: 14, paddingVertical: 10 }]}
                >
                  <TranslatedText style={[styles.categoryButtonText, styles.categoryButtonTextActive, { color: '#fff' }]}>{category}</TranslatedText>
                </LinearGradient>
              ) : (
                <View style={[styles.categoryButton, { backgroundColor: '#f8b87bff', paddingHorizontal: 14, paddingVertical: 10 }]}> 
                  <TranslatedText style={[styles.categoryButtonText, { color: '#fff' }]}>{category}</TranslatedText>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderProgressCard = () => (
    <View style={styles.progressCard}>
       <LinearGradient
            colors={['#FF693C', '#C5302E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
          />
      <TranslatedText style={styles.progressTitle}>Your progress</TranslatedText>
      <View style={styles.progressStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{progressStats.totalCourses}</Text>
          <TranslatedText style={styles.statLabel}>Total Courses</TranslatedText>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{progressStats.inProgress}</Text>
          <TranslatedText style={styles.statLabel}>In Progress</TranslatedText>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{progressStats.completed}</Text>
          <TranslatedText style={styles.statLabel}>Completed</TranslatedText>
        </View>
      </View>
    </View>
  );

  const renderInProgressCourses = () => (
    <View style={styles.coursesSection}>
      <TranslatedText style={[styles.sectionTitle, isDark ? { color: '#fff' } : {}]}>In progress</TranslatedText>
      {inProgressCourses.map((course, index) => (
        <CourseCard
          key={`in-progress-${course.id}-${index}`}
          title={course.title}
          progress={course.progress}
          type={course.type}
          imageUrl={course.imageUrl}
          onPress={() => navigation.navigate('ResumeCourse', {
            courseId: course.id.toString()
          })}
          onResume={() => navigation.navigate('ResumeCourse', {
            courseId: course.id.toString()
          })}
        />
      ))}
    </View>
  );

  const getFilteredCourses = () => {
    if (selectedCategory === 'All Courses') {
      return availableCourses;
    }
    
    return availableCourses.filter(course => {
      switch (selectedCategory) {
        case 'Beginner':
          return course.level === 'Beginner';
        case 'Intermediate':
          return course.level === 'Intermediate';
        case 'Advanced':
          return course.level === 'Advanced';
        case 'Digital Skills':
          return course.tags?.includes('Digital') || course.tags?.includes('Tech') || course.tags?.includes('Tools');
        case 'Career':
          return course.tags?.includes('Career') || course.tags?.includes('Job') || course.tags?.includes('Work') || course.tags?.includes('Business');
        default:
          return true;
      }
    });
  };

  const renderAvailableCourses = () => {
    const filteredCourses = getFilteredCourses();
    
    return (
      <View style={styles.coursesSection}>
        <TranslatedText style={[styles.sectionTitle, isDark ? { color: '#fff' } : {}]}>Available courses</TranslatedText>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => (
            <AvailableCourseCard
              key={`avail-${course.id}-${index}`}
              title={course.title}
              duration={course.duration}
              level={course.level}
              tags={course.tags}
              icon={course.icon}
              imageUrl={course.imageUrl}
              type={course.type}
              onPress={() => navigation.navigate('CourseDetails', { 
                courseId: course.id.toString(),
                videoUrl: course.videoUrl || ''
              })}
              onEnroll={() => {
                Alert.alert(
                  'Enrollment Successful',
                  `You have enrolled in ${course.title}.`,
                  [{ text: 'OK' }]
                );
                setAvailableCourses(prev => prev.filter(c => c.id !== course.id));
                setInProgressCourses(prev => [
                  ...prev,
                  {
                    id: course.id,
                    title: course.title,
                    progress: 0,
                    type: course.type,
                    imageUrl: course.imageUrl,
                  }
                ]);
              }}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <TranslatedText style={[styles.emptyStateText, isDark ? { color: '#ddd' } : {}]}>{`No courses available for ${selectedCategory}`}</TranslatedText>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }] }>
      <ScrollView style={[styles.scrollView, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderProgressCard()}
        {renderInProgressCourses()}
        {renderCategoryFilters()}
        {renderAvailableCourses()}
      </ScrollView>
      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E67012',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#ffaf1a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#E67012',
  },
  categoryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  progressCard: {
    // backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  progressTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  coursesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

});

export default LessonsMenu;