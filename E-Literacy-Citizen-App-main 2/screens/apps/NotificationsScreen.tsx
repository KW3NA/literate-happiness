import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Linking, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome6 } from '@expo/vector-icons';
import TranslatedText from '../../components/TranslatedText';
import { useTheme } from '../../components/ThemeContext';
import BottomTabBar from '../../components/BottomTabBar';

const mockNotifications = [
  {
    id: 1,
    title: 'Course Completed!',
    message: 'Congratulations! You have completed "Digital Literacy Basics"',
    time: '2 hours ago',
    type: 'success',
    read: false,
  },
  {
    id: 2,
    title: 'New Assessment Available',
    message: 'A new assessment for "Internet Safety" is now available',
    time: '1 day ago',
    type: 'info',
    read: false,
  },
  {
    id: 3,
    title: 'CV Generated Successfully',
    message: 'Your CV has been generated and is ready for download',
    time: '2 days ago',
    type: 'success',
    read: true,
  },
  {
    id: 4,
    title: 'Course Reminder',
    message: 'Don\'t forget to continue your "Email Communication" course',
    time: '3 days ago',
    type: 'reminder',
    read: true,
  },
];

const mockOpportunities = [
  {
    id: 1,
    title: 'Digital Skills Workshop',
    date: '2024-02-15',
    time: '09:00 - 17:00',
    location: 'Cape Town Community Center',
    description: 'A comprehensive workshop covering basic computer skills, internet safety, and digital communication. Perfect for beginners looking to improve their digital literacy.',
    organizer: 'Digital Skills Foundation',
    registrationLink: 'https://example.com/register/workshop1',
    image: require('../../assets/Opportunity.jpeg'),
  },
  {
    id: 2,
    title: 'Job Fair: Tech Opportunities',
    date: '2024-02-20',
    time: '10:00 - 16:00',
    location: 'Johannesburg Convention Centre',
    description: 'Meet with top employers in the tech industry. Bring your CV and network with hiring managers from leading companies.',
    organizer: 'Career Connect SA',
    registrationLink: 'https://example.com/register/jobfair',
    image: require('../../assets/logo.jpg'),
  },
  {
    id: 3,
    title: 'Entrepreneurship Seminar',
    date: '2024-02-25',
    time: '14:00 - 18:00',
    location: 'Durban Business Hub',
    description: 'Learn how to start your own business in the digital age. Topics include online marketing, e-commerce, and digital payment systems.',
    organizer: 'Entrepreneur Network',
    registrationLink: 'https://example.com/register/seminar',
    image: require('../../assets/logo.jpg'),
  },
];

const NotificationsScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  // Persist read/unread state so the Home bell badge stays in sync
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('@notifications_read');
        if (raw) {
          const saved = JSON.parse(raw);
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: saved[n.id] ?? n.read }))
          );
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const persistReadState = (list) => {
    const unread = list.filter((n) => !n.read).length;
    const map: Record<number, boolean> = {};
    list.forEach((n) => { map[n.id] = n.read; });
    AsyncStorage.setItem('@notifications_read', JSON.stringify(map)).catch(() => { });
    AsyncStorage.setItem('@unread_notifications', String(unread)).catch(() => { });
  };

  const markAsRead = (id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      persistReadState(next);
      return next;
    });
  };

  const clearAll = () => {
    const empty = [];
    setNotifications(empty);
    AsyncStorage.setItem('@unread_notifications', '0').catch(() => { });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: '#28a745' };
      case 'info':
        return { name: 'info-circle', color: '#17a2b8' };
      case 'reminder':
        return { name: 'clock', color: '#ffc107' };
      default:
        return { name: 'bell', color: '#6c757d' };
    }
  };

  const renderNotification = (notification) => {
    const icon = getNotificationIcon(notification.type);
    
    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationCard,
          {
            backgroundColor: isDark ? '#313131ff' : '#fff',
            borderLeftColor: icon.color,
            opacity: notification.read ? 0.7 : 1,
          },
        ]}
        onPress={() => markAsRead(notification.id)}
      >
        <View style={styles.notificationContent }>
          <View style={styles.notificationHeader}>
            <FontAwesome6 name={icon.name} size={20} color={icon.color} />
            <View style={styles.notificationInfo}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>
                {notification.title}
              </Text>
              <Text style={[styles.notificationTime, { color: colors.muted }]}>
                {notification.time}
              </Text>
            </View>
            {!notification.read && (
              <View style={styles.unreadDot} />
            )}
          </View>
          <Text style={[styles.notificationMessage, { color: colors.muted }]}>
            {notification.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <FontAwesome6 name="arrow-left" size={20} color="#E67012" />
        </TouchableOpacity>
        <TranslatedText style={styles.headerTitle}>Notifications</TranslatedText>
        <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
          <Text style={[styles.clearButtonText, { color: colors.muted }]}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length > 0 ? (
          <View style={styles.notificationsList}>
            {notifications.map(renderNotification)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome6 name="bell-slash" size={64} color={colors.muted} />
            <TranslatedText style={[styles.emptyTitle, { color: colors.text }]}>
              No Notifications
            </TranslatedText>
            <TranslatedText style={[styles.emptyMessage, { color: colors.muted }]}>
              You're all caught up! Check back later for updates.
            </TranslatedText>
          </View>
        )}

        {/* Opportunities Section */}
        <View style={styles.opportunitiesSection}>
          <TranslatedText style={[styles.sectionTitle, { color: colors.text }]}>Opportunities</TranslatedText>
          {mockOpportunities.map((opportunity) => (
            <TouchableOpacity
              key={opportunity.id}
              style={[styles.opportunityCard, { backgroundColor: colors.card }]}
              onPress={() => {
                setSelectedOpportunity(opportunity);
                setShowOpportunityModal(true);
              }}
            >
              <Image
                source={opportunity.image}
                style={styles.opportunityCardImage}
                resizeMode="cover"
              />
              <View style={styles.opportunityContent}>
                <View style={styles.opportunityHeader}>
                  <FontAwesome6 name="calendar" size={20} color="#E67012" />
                  <View style={styles.opportunityInfo}>
                    <Text style={[styles.opportunityTitle, { color: colors.text }]}>
                      {opportunity.title}
                    </Text>
                    <Text style={[styles.opportunityDateTime, { color: colors.muted }]}>
                      📅 {opportunity.date} • ⏰ {opportunity.time}
                    </Text>
                    <Text style={[styles.opportunityLocation, { color: colors.muted }]}>
                      📍 {opportunity.location}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Opportunity Detail Modal */}
      <Modal
        visible={showOpportunityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOpportunityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedOpportunity?.title}
              </Text>
              <TouchableOpacity
                onPress={() => setShowOpportunityModal(false)}
                style={styles.closeButton}
              >
                <FontAwesome6 name="x" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalDetails}>
              <View style={styles.modalDetailRow}>
                <FontAwesome6 name="calendar" size={16} color="#E67012" />
                <Text style={[styles.modalDetailText, { color: colors.text }]}>
                  {selectedOpportunity?.date}
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <FontAwesome6 name="clock" size={16} color="#E67012" />
                <Text style={[styles.modalDetailText, { color: colors.text }]}>
                  {selectedOpportunity?.time}
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <FontAwesome6 name="location-dot" size={16} color="#E67012" />
                <Text style={[styles.modalDetailText, { color: colors.text }]}>
                  {selectedOpportunity?.location}
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <FontAwesome6 name="user" size={16} color="#E67012" />
                <Text style={[styles.modalDetailText, { color: colors.text }]}>
                  {selectedOpportunity?.organizer}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.modalDescription, { color: colors.muted }]}>
              {selectedOpportunity?.description}
            </Text>
            
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => {
                if (selectedOpportunity?.registrationLink) {
                  Linking.openURL(selectedOpportunity.registrationLink);
                }
              }}
            >
              <Text style={styles.registerButtonText}>Register Now</Text>
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
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationsList: {
    paddingVertical: 20,
    paddingBottom: 100,
  },
  notificationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E67012',
    marginTop: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  opportunitiesSection: {
    marginTop: 10,
    paddingBottom: 100,
  },
  opportunityCardImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  opportunityContent: {
    // padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  opportunityCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  opportunityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  opportunityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  opportunityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  opportunityDateTime: {
    fontSize: 12,
    marginBottom: 2,
  },
  opportunityLocation: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  modalDetails: {
    marginBottom: 16,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalDetailText: {
    fontSize: 14,
    marginLeft: 12,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: '#E67012',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationsScreen;