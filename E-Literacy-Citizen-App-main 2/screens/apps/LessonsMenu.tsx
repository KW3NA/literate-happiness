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

type InProgressCourse = {
  id: string | number;
  title: string;
  progress: number;
  type: 'coding' | 'ai' | 'ml';
  imageUrl: string;
};

type AvailableCourse = {
  id: string | number;
  title: string;
  type: 'coding' | 'ai' | 'ml';
  duration: string;
  level: string;
  tags: string;
  icon: string;
  imageUrl: string;
  videoUrl?: string;
};

function LessonsMenu({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('All Courses');
  const [inProgressCourses, setInProgressCourses] = useState<InProgressCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressStats, setProgressStats] = useState({
    totalCourses: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    async function loadSupabaseData() {
      try {
        setLoading(true);
        const { data: dbCourses, error: courseErr } = await supabase
          .from('courses')
          .select('*')
          .eq('status', 'approved')
          .eq('is_published', true);

        if (courseErr) throw courseErr;

        const mapped: AvailableCourse[] = (dbCourses || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          type: (c.competency_area === 'using_devices' ? 'coding' : (c.competency_area === 'staying_safe' ? 'ai' : 'ml')) as any,
          duration: c.duration || `${c.estimated_minutes || 30} mins`,
          level: c.level,
          tags: `${c.level} • ${(c.competency_area || 'digital').replace(/_/g, ' ')}`,
          icon: c.competency_area === 'using_devices' ? 'desktop' : 'shield-halved',
          imageUrl: c.image_url || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
          videoUrl: c.video_url || '',
        }));
        setAvailableCourses(mapped);

        // Fetch enrollments for current user
        const { data: { user } } = await supabase.auth.getUser();
        let enrollmentsQuery = supabase.from('enrollments').select('*, courses(*)');
        if (user) {
          enrollmentsQuery = enrollmentsQuery.eq('user_id', user.id);
        }
        const { data: enrollments } = await enrollmentsQuery;

        if (enrollments) {
          const inProgress = enrollments
            .filter((e: any) => !e.completed)
            .map((e: any) => ({
              id: e.course_id || e.id,
              title: e.courses?.title || 'Enrolled Course',
              progress: e.progress || 0,
              type: 'coding' as const,
              imageUrl: e.courses?.image_url || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
            }));
          setInProgressCourses(inProgress);

          const completedCount = enrollments.filter((e: any) => e.completed).length;
          setProgressStats({
            totalCourses: mapped.length,
            inProgress: inProgress.length,
            completed: completedCount,
          });
        } else {
          setProgressStats({
            totalCourses: mapped.length,
            inProgress: 0,
            completed: 0,
          });
        }
      } catch (e) {
        console.error('Error loading courses from Supabase:', e);
      } finally {
        setLoading(false);
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