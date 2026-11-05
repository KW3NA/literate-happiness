import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../navigation/types';
import { useLanguage, getLanguageName, SupportedLanguage } from '../../components/LanguageContext';
import { useTheme } from '../../components/ThemeContext';

// All languages supported by the app (must match LanguageContext.SupportedLanguage)
const languageOptions: SupportedLanguage[] = ['en', 'af', 'zu', 'xh', 'tn', 've', 'ts', 'nso', 'st', 'nr', 'ss'];

const SETTINGS_KEY = '@app_settings';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { isDark, toggleTheme, colors } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const notificationTones = [
    { label: t('settings.toneDefault'), value: 'default' },
    { label: t('settings.toneChime'), value: 'chime' },
    { label: t('settings.toneBell'), value: 'bell' },
    { label: t('settings.toneAlert'), value: 'alert' },
  ];
  const [notificationTone, setNotificationTone] = useState('default');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [useCellular, setUseCellular] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [pendingLang, setPendingLang] = useState<SupportedLanguage>(language);
  const [isLangModalVisible, setIsLangModalVisible] = useState(false);

  // Load persisted settings on mount
  React.useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const saved = JSON.parse(raw);
          if (typeof saved.enableNotifications === 'boolean') setEnableNotifications(saved.enableNotifications);
          if (typeof saved.useCellular === 'boolean') setUseCellular(saved.useCellular);
          if (typeof saved.offlineMode === 'boolean') setOfflineMode(saved.offlineMode);
          if (typeof saved.notificationTone === 'string') setNotificationTone(saved.notificationTone);
        } catch {}
      })
      .catch(() => {});
  }, []);

  const handleToggleDarkMode = () => {
    toggleTheme();
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ enableNotifications, useCellular, offlineMode, notificationTone })
      );
      Alert.alert(t('settings.saved'), t('settings.settingsSaved'));
    } catch {
      Alert.alert(t('common.error'), t('settings.settingsSaveError'));
    }
  };

  const openLangModal = () => {
    setPendingLang(language);
    setIsLangModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left" size={20} color="#E67012" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primary }]}>{t('settings.title')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Toggles */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
          <View style={[styles.itemRow, styles.firstRow]}>
            <View style={styles.optionLeft}>
              <FontAwesome6 name="moon" size={18} color="#E67012" style={styles.icon} />
              <Text style={[styles.label, { color: colors.text }]}>{t('settings.darkMode')}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleToggleDarkMode}
              thumbColor={isDark ? '#E67012' : '#fff'}
              trackColor={{ false: '#ccc', true: '#333' }}
            />
          </View>

          <View style={styles.itemRow}>
            <View style={styles.optionLeft}>
              <FontAwesome6 name="bell" size={18} color="#E67012" style={styles.icon} />
              <Text style={[styles.label, { color: colors.text }]}>{t('settings.enableNotifications')}</Text>
            </View>
            <Switch
              value={enableNotifications}
              onValueChange={setEnableNotifications}
              thumbColor={enableNotifications ? '#E67012' : '#fff'}
              trackColor={{ false: '#ccc', true: '#333' }}
            />
          </View>

          <View style={styles.itemRow}>
            <View style={styles.optionLeft}>
              <FontAwesome6 name="signal" size={18} color="#E67012" style={styles.icon} />
              <Text style={[styles.label, { color: colors.text }]}>{t('settings.useCellular')}</Text>
            </View>
            <Switch
              value={useCellular}
              onValueChange={setUseCellular}
              thumbColor={useCellular ? '#E67012' : '#fff'}
              trackColor={{ false: '#ccc', true: '#333' }}
            />
          </View>

          <View style={[styles.itemRow, styles.lastRow]}>
            <View style={styles.optionLeft}>
              <FontAwesome6 name="link-slash" size={18} color="#E67012" style={styles.icon} />
              <Text style={[styles.label, { color: colors.text }]}>{t('settings.offlineMode')}</Text>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              thumbColor={offlineMode ? '#E67012' : '#fff'}
              trackColor={{ false: '#ccc', true: '#333' }}
            />
          </View>
        </View>

        {/* Pickers */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
          <TouchableOpacity style={[styles.itemRow, styles.firstRow]} onPress={openLangModal}>
            <View style={styles.optionLeft}>
              <Ionicons name="language-outline" size={20} color="#E67012" style={styles.icon} />
              <Text style={[styles.label, { color: colors.text }]}>{t('settings.language')}</Text>
            </View>
            <View style={styles.valueRight}>
              <Text style={styles.valueText}>{getLanguageName(language)}</Text>
              <Ionicons name="chevron-forward" size={18} color="#E67012" />
            </View>
          </TouchableOpacity>

          <View style={[styles.itemRow, styles.lastRow]}>
            <View style={styles.optionLeft}>
              <Ionicons name="musical-notes-outline" size={20} color="#E67012" style={styles.icon} />
              <Text style={[styles.label, { color: colors.text }]}>{t('settings.notificationTone')}</Text>
            </View>
            <View style={styles.toneButtons}>
              {notificationTones.map((tone) => {
                const active = notificationTone === tone.value;
                return (
                  <TouchableOpacity
                    key={tone.value}
                    onPress={() => setNotificationTone(tone.value)}
                    style={[styles.toneChip, active && styles.toneChipActive]}
                  >
                    <Text style={[styles.toneChipText, active && styles.toneChipTextActive]}>
                      {tone.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={handleSave} style={styles.actionWrap}>
            <LinearGradient
              colors={['#FF9800', '#FF6D00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}
            >
              <Text style={[styles.actionText, { color: '#fff' }]}>{t('profile.saveChanges')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.actionWrap}>
            <LinearGradient
              colors={['#E72020', '#D6593A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}
            >
              <Text style={[styles.actionText, { color: '#fff' }]}>{t('common.cancel')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language selection modal */}
      {isLangModalVisible && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={StyleSheet.absoluteFill}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && { backgroundColor: '#1e1e1e' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>
              {t('profile.selectLanguageTitle')}
            </Text>
            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {languageOptions.map((code) => {
                const active = pendingLang === code;
                return (
                  <TouchableOpacity
                    key={code}
                    onPress={() => setPendingLang(code)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={[styles.langOption, active && styles.langOptionActive]}
                  >
                    <Text style={[styles.langOptionText, active && styles.langOptionTextActive]}>
                      {getLanguageName(code)}
                    </Text>
                    {active && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsLangModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={{ color: '#7e7d7d', fontWeight: '600' }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <LinearGradient
                colors={['#FF9800', '#FF6D00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalSaveBtn}
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
        </View>
        </KeyboardAvoidingView>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E67012',
  },
  body: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  firstRow: {
    // top row of a card
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  valueRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    color: '#E67012',
    fontWeight: 'bold',
    marginRight: 6,
  },
  toneButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
    flexShrink: 1,
  },
  toneChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E67012',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  toneChipActive: {
    backgroundColor: '#F57C00',
    borderColor: '#F57C00',
  },
  toneChipText: {
    color: '#E67012',
    fontSize: 12,
    fontWeight: '600',
  },
  toneChipTextActive: {
    color: '#fff',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 12,
  },
  actionWrap: {
    flex: 1,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    width: '100%',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalSaveBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
});

export default SettingsScreen;
