import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Svg, Circle, Text as SvgText } from 'react-native-svg';
import "../../global.css";
import BottomTabBar from '../../components/BottomTabBar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import TranslatedText from '../../components/TranslatedText';

import { useTheme } from '../../components/ThemeContext';

import { useAuthGuard } from '../../src/hooks/useAuthGuard';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';



type Props = NativeStackScreenProps<RootStackParamList, 'Home Screen'>;

const HomeScreen = ({ navigation }: Props) => {
  const { colors, isDark } = useTheme();
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
    const { user, loading, signOut, refreshMe } = useAuthGuard(navigation);
  const username = user?.name ?? "-";

  const avatarUri = user?.profile_picture_url ?? 'https://i.pravatar.cc/200?u=fallback';
  
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Load real skill progress + unread notifications from Supabase enrollments
  const loadProgress = React.useCallback(async () => {
    try {
      const userId = user?.id;
      if (!userId) return;
      const { data: enr } = await supabase
        .from('enrollments')
        .select('progress')
        .eq('user_id', userId);
      if (enr && enr.length > 0) {
        const avg = Math.round(
          enr.reduce((s, e) => s + (e.progress ?? 0), 0) / enr.length
        );
        setProgress(avg);
      } else {
        setProgress(0);
      }
    } catch {
      /* keep current value on network failure */
    }
  }, [user?.id]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('@unread_notifications');
        const n = raw ? parseInt(raw, 10) : 3;
        setNotificationCount(Number.isFinite(n) ? n : 0);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refreshMe().catch(() => { });
      loadProgress();
      AsyncStorage.getItem('@unread_notifications').then((raw) => {
        if (raw !== null) {
          const n = parseInt(raw, 10);
          setNotificationCount(Number.isFinite(n) ? n : 0);
        }
      }).catch(() => { });
    }, [refreshMe, loadProgress])
  );

  useEffect(() => {
    const checkNewUser = async () => {
      if (!loading && user) {
        const isNewUser = await AsyncStorage.getItem('isNewUser');
        if (isNewUser === 'true') {
          setShowNameModal(true);
          await AsyncStorage.removeItem('isNewUser');
        }
      }
    };
    checkNewUser();
  }, [loading, user]);

  // Real-time clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
      setCurrentTime(timeString);
    };

    // Update time immediately
    updateTime();
    
    // Update time every second
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);


  if (loading) {
    // optional: show a loader/skeleton while we verify token & fetch /mobile/me
    return (
      <SafeAreaView style={{ flex: 1,  alignItems: 'center', backgroundColor: '#fff' }}>
        <Image source={require('../../assets/logo.jpg')} style={{ width: 300, height: 300, marginTop: 100 }} />
          <TranslatedText style={{ marginTop: 10, fontSize: 16, fontWeight: '500', color: '#E67012' }}>Empowering Digital Futures</TranslatedText>
  
        <ActivityIndicator size="large" color="#E67012" style={{ marginTop: 10 }} />
      </SafeAreaView>
    );
  }
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  const actionCards: {
    icon: string;
    title: string;
    desc: string;
    bgColor: string;
    iconColor: string;
  }[] = [
    {
      icon: "graduation-cap",
      title: "Learning Hub",
      desc: "Access learning materials to enhance your digital skills",
      bgColor: '#F3E5F5',
      iconColor: "#9C27B0",
    },
    {
      icon: "clipboard-check",
      title: "Take Assessment",
      desc: "Evaluate your current skills and earn your certificate",
      bgColor: '#FFF3E0',
      iconColor: "#E67012",
    },
    {
      icon: "file-alt",
      title: "Build My CV",
      desc: "Create a professional CV to showcase your skills and apply for jobs",
      bgColor: '#E3F2FD',
      iconColor: "#1E90FF",
    },
    {
       icon: "magic",
      title: "Explore Tools",
      desc: "Explore extra features that enhance your learning experience",
      bgColor: '#e3fde9ff',
      iconColor: "#21a55cff",
    },
  ];

  // Dark-mode card background overrides (user-specified)
  const darkCardBg: Record<string, string> = {
    'Take Assessment': '#5a432e',
    'Learning Hub': '#4a3453',
    'Build My CV': '#234455',
    'Explore Tools': '#235539ff',
  };

  const recentActivities: {
    icon: string;
    title: string;
    time: string;
  }[] = [
    { icon: "book-open", title: 'Completed "Digital Skills 101"', time: 'Yesterday at 3:45 PM' },
    { icon: "trophy", title: 'Earned Digital Skills 101 Certificate', time: 'April 20, 2025' },
    { icon: "clipboard-list", title: 'Started "Staying Safe Online"', time: 'April 18, 2025' },
  ];

  const avatar =
    user?.profile_picture_url ??
    'https://i.pravatar.cc/100?img=12';



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Top Navigation */}
      <View style={[styles.header, { backgroundColor: colors.card }]}> 
        <TranslatedText style={[styles.logo, { color: colors.primary }]}>E-Literacy</TranslatedText>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <FontAwesome5 name="bell" size={20} color={colors.muted} />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={require('../../assets/user.png')}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Welcome Banner */}
        <View style={[styles.welcomeBanner, isDark ? { backgroundColor: '#464545' } : {}]}>
          <TranslatedText style={[styles.welcomeText, isDark ? { color: '#fff' } : { color: '#666' }]}>Welcome back,</TranslatedText>
          <Text style={[styles.usernameText, { color: colors.primary }]}>{username}</Text>
          <View style={styles.timeDateContainer}>
            <Text style={[styles.dateText, isDark ? { color: '#fff' } : { color: colors.muted }]}>{currentDate}</Text>
          </View>
        </View>

        {/* Skill Progress */}
        <View style={styles.progressContainer}>
          <Svg height="100" width="100">
            <Circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#f0f0f0"
              strokeWidth="8"
              fill="none"
            />
            <Circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#8B5CF6"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
            <SvgText
              x="50"
              y="55"
              fill="#1E90FF"
              fontSize="20"
              fontWeight="bold"
              textAnchor="middle"
            >
              {progress}%
            </SvgText>
          </Svg>
          <TranslatedText style={[styles.progressTitle, { color: colors.text }]}>
            Your skill progress is looking great!
          </TranslatedText>
          <TranslatedText style={[styles.progressSubtitle, { color: colors.muted }]}> 
            Complete your next course to level up
          </TranslatedText>
        </View>

        {/* Action Cards */}
        {actionCards.map((item, index) => (
            <TouchableOpacity
            key={index}
            style={[
              styles.card,
              { backgroundColor: isDark ? (darkCardBg[item.title] || item.bgColor) : item.bgColor }
            ]}
            onPress={
              item.title === 'Learning Hub'
                ? () => navigation.navigate('Learn')
                : item.title === 'Take Assessment'
                ? () => navigation.navigate('TakeAssessmentsMenu')
                : item.title === 'Build My CV'
                ? () => navigation.navigate('CVBuilder')
                : item.title === "Explore Tools"
                ? () => navigation.navigate("Tools")
                : undefined
            }
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Text>
                  <FontAwesome5 name={item.icon} size={20} color={item.iconColor} />
                </Text>
              </View>
              <View style={styles.cardTextContainer}>
                <TranslatedText style={[styles.cardTitle, isDark ? { color: '#fff' } : {}]}>{item.title}</TranslatedText>
                <TranslatedText style={[styles.cardDescription, isDark ? { color: '#ccc' } : {}]}>{item.desc}</TranslatedText>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <TranslatedText style={[styles.sectionTitle, isDark ? { color: '#fff' } : {}]}>Recent Activity</TranslatedText>
          {recentActivities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#E3F2FD' }]}>
                <Text>
                  <FontAwesome5 name={activity.icon} size={16} color="#1E90FF" />
                </Text>
              </View>
              <View style={styles.activityTextContainer}>
                <TranslatedText style={[styles.activityTitle, isDark ? { color: '#fff' } : {}]}>{activity.title}</TranslatedText>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showNameModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <FontAwesome6 name="user" size={30} color={colors.primary} style={{ marginBottom: 12, marginTop: 12 }} />
            <TranslatedText style={[styles.modalTitle, { color: colors.primary }]}>
              Complete Your Profile
            </TranslatedText>
            <TextInput
              style={[styles.nameInput, { borderColor: colors.muted, color: colors.text }]}
              placeholder="Name and Surname"
              placeholderTextColor={colors.muted}
              value={firstName}
              onChangeText={setFirstName}
            />
            
            <TouchableOpacity 
              disabled={!firstName.trim() || savingName}
              style={[styles.saveButton, { backgroundColor: colors.primary }, !firstName.trim() && { opacity: 0.6 }]}
              onPress={async () => {
                const trimmed = firstName.trim();
                if (!trimmed) return;
                try {
                  setSavingName(true);
                  if (user?.id) {
                    await supabase
                      .from('users')
                      .update({ name: trimmed, updated_at: new Date().toISOString() })
                      .eq('id', user.id);
                  }
                  const cached = await AsyncStorage.getItem('user');
                  if (cached) {
                    const u = JSON.parse(cached);
                    u.name = trimmed;
                    await AsyncStorage.setItem('user', JSON.stringify(u));
                  }
                  await refreshMe().catch(() => { });
                  setShowNameModal(false);
                  Alert.alert('Details Saved', `Welcome, ${trimmed}!`);
                } catch {
                  Alert.alert('Something went wrong', 'Could not save your name. Please try again.');
                } finally {
                  setSavingName(false);
                }
              }}
            >
               <LinearGradient
                          colors={['#FF9800', '#FF6D00']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
                        />
              <TranslatedText style={styles.saveButtonText}>Save</TranslatedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E67012',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E67012',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  welcomeBanner: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
  },
  usernameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E67012',
    marginTop: 4,
  },
  timeDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E67012',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  card: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  activitySection: {
    marginTop: 32,
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',

  },
  modalContent: {
    padding: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  nameInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  saveButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
