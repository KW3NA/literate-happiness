import * as React from 'react';
import { useState, useEffect } from 'react';
import { requestAndFetchLocation, getLocationNameFromCoords } from '../../components/locationUtils';
import Constants from 'expo-constants';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useLanguage, getLanguageName, SupportedLanguage } from '../../components/LanguageContext';
import { useTranslation } from 'react-i18next';
import { useUser, UserData } from '../../components/UserContext';
import { useTheme } from '../../components/ThemeContext';
import { Modal as RNModal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TranslatedText from '../../components/TranslatedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authGet, API_BASE } from '../../config/api';
import { authUpload } from '../../config/api';
import { authPost } from '../../config/api';
import { sendEmailOtp } from '../../config/api';
import { updateProfile } from '../../config/api';

// Helper function to convert relative path to full URL
const getFullImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;

  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Remove /api from API_BASE and append the path
  const baseUrl = API_BASE.replace('/api', '');

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

// All languages supported by the app (must match LanguageContext.SupportedLanguage)
const ALL_LANGUAGES: SupportedLanguage[] = ['en', 'af', 'zu', 'xh', 'tn', 've', 'ts', 'nso', 'st', 'nr', 'ss'];

// Format the account creation date nicely (backend returns ISO strings like "2024-01-15T08:30:00.000000Z")
const formatJoinDate = (value: string | undefined | null): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen = ({ navigation }: Props) => {
  const { userData, setUserData } = useUser();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isLocLoading, setIsLocLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [isLangModalVisible, setIsLangModalVisible] = useState(false);
  const [pendingLang, setPendingLang] = useState<SupportedLanguage>(language);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const OPENCAGE_API_KEY =
    Constants.expoConfig?.extra?.OPENCAGE_API_KEY ||
    (Constants.manifest && 'extra' in Constants.manifest
      ? (Constants.manifest as any).extra?.OPENCAGE_API_KEY
      : '') ||
    '';

  // Keep the modal selection in sync with the active language when opened
  useEffect(() => {
    if (isLangModalVisible) setPendingLang(language);
  }, [isLangModalVisible, language]);

  // Merge backend user fields onto locally-known fields (joinDate, stats, etc.)
  // so that refreshing from the API never wipes data the backend doesn't return.
  const mergeUser = (incoming: Partial<UserData> | null | undefined, base: UserData): UserData => {
    if (!incoming) return base;
    const merged: UserData = { ...base };
    (Object.keys(incoming) as (keyof UserData)[]).forEach((key) => {
      const value = incoming[key];
      if (value !== undefined && value !== null && value !== '') {
        (merged as any)[key] = value;
      }
    });
    return merged;
  };

  // 🔹 Load profile (cached + backend refresh)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cached = await AsyncStorage.getItem('user');
        if (cached && mounted) {
          try {
            const parsed: UserData = JSON.parse(cached);
            setUser(parsed);
            setProfileImage(getFullImageUrl(parsed.profile_picture_url));
            setUserData(parsed);
          } catch {
            await AsyncStorage.removeItem('user');
          }
        }

        const me = await authGet<{ user: Partial<UserData> }>('/mobile/me');
        if (mounted) {
          const merged = mergeUser(me.user, (user ?? userData) as UserData);
          setUser(merged);
          setProfileImage(getFullImageUrl(merged.profile_picture_url));
          setUserData(merged);
          await AsyncStorage.setItem('user', JSON.stringify(merged));
        }
      } catch (e) {
        await AsyncStorage.multiRemove(['token', 'user']);
        if (mounted) navigation.replace('Login');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, setUserData]);

  // 🔹 Refresh profile data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshProfile = async () => {
        try {
          const me = await authGet<{ user: Partial<UserData> }>('/mobile/me');

          if (me.user) {
            // Merge instead of replacing so local-only fields
            // (joinDate, completedCourses, currentLevel) survive the refresh.
            const merged = mergeUser(me.user, (user ?? userData) as UserData);
            setUser(merged);
            setProfileImage(getFullImageUrl(merged.profile_picture_url));
            setUserData(merged);
            await AsyncStorage.setItem('user', JSON.stringify(merged));
          }
        } catch (e) {
          console.log('Failed to refresh profile:', e);
        }
      };
      refreshProfile();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, userData, setUserData])
  );

  // 🔹 Update location
  const handleUpdateLocation = async () => {
    if (isLocLoading) return;
    setIsLocLoading(true);
    try {
      const loc = await requestAndFetchLocation();
      if (!loc || !loc.permission) {
        Alert.alert(t('profile.permissionNeeded'), t('profile.locationPermissionRequired'));
        return;
      }
      const { latitude, longitude } = loc.coords;
      const locationName = await getLocationNameFromCoords(latitude, longitude, OPENCAGE_API_KEY);
      if (locationName) {
        // Save on the backend first so the change persists across devices
        try {
          const response = await updateProfile({ location: locationName });
          const merged = mergeUser(response?.user, { ...(user ?? userData), location: locationName });
          setUser(merged);
          setUserData(merged);
          await AsyncStorage.setItem('user', JSON.stringify(merged));
        } catch {
          // Even if the backend call fails, keep the fresh local value
          const updated = { ...(user ?? userData), location: locationName };
          setUser(updated);
          setUserData(updated);
          await AsyncStorage.setItem('user', JSON.stringify(updated));
        }
        Alert.alert(t('profile.success'), t('profile.locationUpdated'));
      } else if (!OPENCAGE_API_KEY) {
        Alert.alert(
          t('profile.noGeocodingKey'),
          t('profile.noGeocodingKeyMessage')
        );
      } else {
        Alert.alert(t('common.error'), t('profile.addressResolveError'));
      }
    } catch (e) {
      console.error('Location update error:', e);
      Alert.alert(t('common.error'), t('profile.locationUpdateFailed'));
    } finally {
      setIsLocLoading(false);
    }
  };

  // 🔹 Email Verification
  const handleEmailVerification = async () => {
    setIsEmailVerifying(true);
    try {
      const response = await sendEmailOtp();
      if (response.status === 'success') {
        Alert.alert(
          t('profile.otpSent'),
          t('profile.otpSentMessage'),
          [
            {
              text: t('common.ok'),
              onPress: () => navigation.navigate('EmailVerification'),
            },
          ]
        );
      } else {
        Alert.alert(t('common.error'), response.message || t('profile.sendCodeFailed'));
      }
    } catch (error) {
      console.error('Email verification error:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('profile.sendCodeFailed')
      );
    } finally {
      setIsEmailVerifying(false);
    }
  };

  // 🔹 Logout
  const handleLogout = async () => {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirmMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            setIsLogoutLoading(true);
            try {
              // Call logout API endpoint
              await authPost('/mobile/logout');
              console.log('✅ Logout API call successful');
            } catch (error) {
              console.log('⚠️ Logout API call failed:', error);
              // Continue with logout even if API call fails
            } finally {
              // Clear local storage
              await AsyncStorage.multiRemove(['token', 'user']);
              console.log('✅ Local storage cleared');
              
              // Reset navigation to login screen
              navigation.reset({ 
                index: 0, 
                routes: [{ name: 'Login' }] 
              });
              setIsLogoutLoading(false);
            }
          },
        },
      ]
    );
  };

  // 🔹 Pick new profile image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('profile.permissionNeeded'), t('profile.photoPermissionNeeded'));
      return;
    }
    
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.92, // High quality (92%)
        base64: false,
        exif: false,
      });
      
      if (!res.canceled && res.assets?.[0]) {
        const asset = res.assets[0];
        
        // Validate file size (max 5MB)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert(t('profile.imageTooLarge'), t('profile.imageTooLargeMessage'));
          return;
        }
        
        // Validate dimensions (optional - warn if too small)
        if (asset.width && asset.height && (asset.width < 100 || asset.height < 100)) {
          Alert.alert(t('profile.imageTooSmall'), t('profile.imageTooSmallMessage'));
          return;
        }
        
        setTempImage(asset.uri);
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(t('common.error'), t('profile.pickImageFailed'));
    }
  };

  const handleSaveImage = async () => {
    if (!tempImage) {
      Alert.alert(t('common.error'), t('profile.noImageSelected'));
      return;
    }
    
    setIsUploadingImage(true);
    try {
      // Determine file type from URI
      const fileExtension = tempImage.split('.').pop()?.toLowerCase();
      let mimeType = 'image/jpeg';
      if (fileExtension === 'png') {
        mimeType = 'image/png';
      } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
        mimeType = 'image/jpeg';
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', {
        uri: tempImage,
        type: mimeType,
        name: `profile_picture.${fileExtension || 'jpg'}`,
      } as any);
      

      // Upload to backend
      const response = await authUpload<{ user: Partial<UserData> }>('/mobile/profile/avatar', formData);

      // Validate response
      if (!response.user) {
        throw new Error('Invalid response from server');
      }

      // Merge uploaded user onto current profile so no fields are lost
      const merged = mergeUser(response.user, (user ?? userData) as UserData);
      setProfileImage(getFullImageUrl(merged.profile_picture_url));
      setUser(merged);
      setUserData(merged);
      await AsyncStorage.setItem('user', JSON.stringify(merged));
      
      // Close modal first, then show success
      setIsModalVisible(false);
      setTempImage(null);
      
      Alert.alert(t('profile.success'), t('profile.pictureUpdated'));
    } catch (error) {
      console.error('❌ Profile picture upload error:', error);
      
      // Determine error message
      let errorMessage = t('profile.pictureUploadFailed');
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      Alert.alert(t('profile.uploadFailed'), errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCancelImage = () => {
    setTempImage(null);
    setIsModalVisible(false);
  };

  // 🔹 Display user (fallback if not loaded yet)
  const displayUser: UserData = user ?? {
    name: userData.name || '—',
    email: userData.email || '',
    location: userData.location || '',
    joinDate: userData.joinDate || '',
    completedCourses: userData.completedCourses || 0,
    currentLevel: userData.currentLevel || '—',
    profile_picture_url: userData.profile_picture_url,
    email_verified_at: userData.email_verified_at,
  };

  // 🔹 Stats
  const stats = [
    { title: t('profile.completedStat'), value: String(displayUser.completedCourses ?? 0), icon: 'checkmark-circle' },
    { title: t('profile.levelStat'), value: displayUser.currentLevel || '—', icon: 'trophy' },
    { title: t('profile.memberSince'), value: formatJoinDate(displayUser.joinDate), icon: 'calendar' },
  ];

  // 🔹 Menu
  const menuItems = [
    { icon: 'person-outline', title: t('profile.editProfile'), onPress: () => navigation.navigate('Edit Profile') },
    { icon: 'settings-outline', title: t('profile.settings'), onPress: () => navigation.navigate('Settings') },
    { icon: 'shield-checkmark-outline', title: t('settings.privacy'), onPress: () => navigation.navigate('Privacy') },
    { icon: 'help-circle-outline', title: t('settings.helpSupport'), onPress: () => navigation.navigate('Help&Support') },
    { 
      icon: isLogoutLoading ? 'refresh' : 'log-out-outline', 
      title: isLogoutLoading ? t('profile.loggingOut') : t('auth.logout'), 
      onPress: handleLogout,
      disabled: isLogoutLoading
    },
  ];

  const { colors, isDark } = useTheme();

  if (loading && !user) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#E67012" />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#E67012" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('profile.title')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Edit Profile')} style={styles.backButton}>
            <Ionicons name="create-outline" size={24} color="#E67012" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={profileImage ? { uri: profileImage } : require('../../assets/user.png')}
              style={styles.avatar}
              onError={(error) => {
                console.log('❌ Image load error:', error);
                console.log('Failed to load image URL:', profileImage);
                // Fallback to default image on error
                setProfileImage(null);
              }}
              onLoad={() => {
                console.log('✅ Image loaded successfully:', profileImage);
              }}
            />
            <TouchableOpacity style={styles.editAvatarButton} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>{displayUser.name}</Text>
          <View style={styles.emailContainer}>
            <Text style={[styles.email, { color: colors.muted }]} numberOfLines={1}>{displayUser.email}</Text>
            {displayUser.email_verified_at ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.verifiedText}>{t('profile.verified')}</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={handleEmailVerification}
                disabled={isEmailVerifying}
              >
                <Ionicons 
                  name={isEmailVerifying ? "refresh" : "mail-outline"} 
                  size={16} 
                  color="#E67012" 
                />
                <Text style={styles.verifyButtonText}>
                  {isEmailVerifying ? t('profile.sending') : t('profile.verifyEmail')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#E67012" />
            <Text style={[styles.location, { color: colors.muted }]} numberOfLines={1}>
              {displayUser.location || t('profile.locationNotSet')}
            </Text>
            <TouchableOpacity
              onPress={handleUpdateLocation}
              disabled={isLocLoading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={t('profile.updateLocation')}
            >
              <Ionicons
                name={isLocLoading ? 'refresh' : 'refresh-outline'}
                size={18}
                color="#E67012"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: isDark ? '#1e1e1e' : '#f8f8f8' }]}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Ionicons name={String(stat.icon)} size={24} color="#E67012" />
              <Text style={[styles.statValue, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>{stat.value}</Text>
              <Text style={[styles.statTitle, { color: isDark ? colors.muted : '#666' }]} numberOfLines={1}>{stat.title}</Text>
            </View>
          ))}
        </View>

        {/* Language Selection */}
        <View style={styles.languageSection}>
          <TouchableOpacity
            style={[styles.languageRow, { borderBottomColor: isDark ? '#333' : '#f0f0f0' }]}
            onPress={() => setIsLangModalVisible(true)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="language-outline" size={22} color="#E67012" />
              <Text style={[styles.languageLabel, { color: isDark ? '#fff' : '#333' }]}>{t('settings.language')}</Text>
            </View>
            <View style={styles.languageRight}>
              <Text style={styles.languageValue}>{getLanguageName(language)}</Text>
              <Ionicons name="chevron-forward" size={18} color="#E67012" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Language Modal */}
        <RNModal
          visible={isLangModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsLangModalVisible(false)}
        >
          <View style={styles.langModalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', alignItems: 'center' }}>
            <View style={[styles.langModalContent, isDark && { backgroundColor: '#1e1e1e' }]}>
              <Text style={[styles.langModalTitle, { color: isDark ? '#fff' : '#000' }]}>{t('profile.selectLanguageTitle')}</Text>
              <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                {ALL_LANGUAGES.map((code) => {
                  const active = pendingLang === code;
                  return (
                    <TouchableOpacity
                      key={code}
                      onPress={() => setPendingLang(code)}
                      style={[styles.langOption, active && styles.langOptionActive]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={[styles.langOptionText, active && styles.langOptionTextActive]}>
                        {getLanguageName(code)}
                      </Text>
                      {active && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={styles.langModalButtons}>
                <TouchableOpacity onPress={() => setIsLangModalVisible(false)} style={styles.langCancelBtn}>
                  <Text style={{ color: '#7e7d7d', fontWeight: '600' }}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <LinearGradient
                  colors={['#FF9800', '#FF6D00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.langSaveBtn}
                >
                  <TouchableOpacity
                    style={{ width: '100%', alignItems: 'center' }}
                    onPress={() => {
                      setLanguage(pendingLang);
                      setIsLangModalVisible(false);
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('common.save')}</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
            </KeyboardAvoidingView>
          </View>
        </RNModal>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: isDark ? colors.muted : '#f0f0f0' }]}
              onPress={item.onPress}
              disabled={item.disabled}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons 
                  name={String(item.icon)} 
                  size={24} 
                  color={
                    item.disabled 
                      ? '#ccc' 
                      : item.title === t('auth.logout') || item.title === t('profile.loggingOut')
                        ? '#FF3B30' 
                        : '#666'
                  } 
                />
                <Text style={[
                  styles.menuItemText, { color: isDark ? colors.muted : "#333" },
                  (item.title === t('auth.logout') || item.title === t('profile.loggingOut')) && styles.logoutText,
                  item.disabled && styles.disabledText
                ]}>
                  {item.title}
                </Text>
              </View>

              {!item.disabled && <Ionicons name="chevron-forward" size={20} color="#E67012" />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={isUploadingImage ? undefined : handleCancelImage}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#2E2E2E' : 'white' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>
                {t('profile.previewPicture')}
              </Text>
              {!isUploadingImage && (
                <TouchableOpacity onPress={handleCancelImage} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.modalImageContainer}>
              {tempImage && <Image
                source={{ uri: tempImage }}
                style={styles.modalImage}
                resizeMode="cover"
              />}
            </View>
            
            <Text style={[styles.modalText, { color: isDark ? '#ccc' : '#666' }]}>
              {isUploadingImage 
                ? t('profile.uploadingPicture') 
                : t('profile.updatePictureConfirm')}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, isUploadingImage && { opacity: 0.5 }]}
                onPress={handleCancelImage}
                disabled={isUploadingImage}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, isUploadingImage && { opacity: 0.7 }]}
                onPress={handleSaveImage}
                disabled={isUploadingImage}
              >
                {isUploadingImage && (
                  <Ionicons name="sync" size={16} color="#fff" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.saveButtonText}>
                  {isUploadingImage ? t('profile.uploading') : t('profile.saveChanges')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E67012',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#E67012',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emailContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E67012',
  },
  verifyButtonText: {
    fontSize: 12,
    color: '#E67012',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '90%',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 8,
    flexShrink: 1,
  },
  languageSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  languageLabel: {
    marginLeft: 12,
    fontSize: 16,
  },
  languageRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageValue: {
    color: '#E67012',
    fontWeight: 'bold',
    marginRight: 6,
  },
  langModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  langModalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E67012',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 5,
    backgroundColor: 'transparent',
  },
  langOptionActive: {
    borderWidth: 0,
    backgroundColor: '#F57C00',
    gap: 8,
  },
  langOptionText: {
    color: '#E67012',
    fontWeight: '600',
    fontSize: 15,
  },
  langOptionTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  langModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    width: '100%',
    gap: 12,
  },
  langCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  langSaveBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  logoutText: {
    color: '#FF3B30',
  },
  disabledText: {
    color: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  modalImageContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#E67012',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#E67012',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ProfileScreen; 