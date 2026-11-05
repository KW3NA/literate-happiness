// App.tsx
import * as React from 'react';
import './i18n'; // initialize i18next (must come before any useTranslation usage)
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackParamList } from './navigation/types';
import { LanguageProvider } from './components/LanguageContext';
import { UserProvider } from './components/UserContext';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, Image, StyleSheet } from 'react-native';

// Hide React Native errors in production
if (!__DEV__) {
  console.error = () => {};
  console.warn = () => {};
  global.ErrorUtils?.setGlobalHandler(() => {});
}

// Screens
import Login_SignUp from './screens/apps/Login_SignUp';
import HomeScreen from './screens/apps/HomeScreen';
import ProfileScreen from './screens/apps/ProfileScreen';
import CVBuilder from './screens/apps/CVpage';
import OnboardingScreen from './screens/apps/Onboading';
import LessonsMenu from './screens/apps/LessonsMenu';
import CourseDetails from './screens/apps/CourseDetails';
import ResumeCourse from './screens/apps/ResumeCourse';

import EditProfile from './screens/apps/EditProfile';
import SettingsScreen from './screens/apps/Settings';
import Privacy from './screens/apps/PrivacyScreen';

import VerificationScreen from './screens/apps/VerificationScreen';
import EmailVerificationScreen from './screens/apps/EmailVerificationScreen';
import TwoFactorScreen from './screens/apps/TwoFactorScreen';
import PhoneVerificationScreen from './screens/apps/PhoneVerificationScreen';

import QuizScreen from './screens/apps/Quiz';
import QuizInstructions from './screens/apps/QuizInstructions';
import TakeAssessmentsMenu from './screens/apps/TakeAssessmentsMenu';
import AssessmentInstructions from './screens/apps/AssessmentInstructions';
import HelpSupport from './screens/apps/Help&Support';
import NotificationsScreen from './screens/apps/NotificationsScreen';

import Assessment from './screens/apps/AssessmentScreen';
import Tools from './screens/apps/Tools';
import WebViewScreen from './screens/apps/WebViewScreen';
import AssessmentResults from './screens/apps/AssessmentResults';
import ForgotPasswordScreen from './screens/apps/ForgotPasswordScreen';
const Stack = createNativeStackNavigator<RootStackParamList>();

function ThemedNavigator() {
  const { isDark } = useTheme();
  return (
    <NavigationContainer theme={isDark ? NavigationDarkTheme : NavigationDefaultTheme}>
      <Stack.Navigator initialRouteName="OnboardingScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={Login_SignUp} />
        <Stack.Screen name="Home Screen" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="CVBuilder" component={CVBuilder} />
        <Stack.Screen name="Learn" component={LessonsMenu} />
        <Stack.Screen name="CourseDetails" component={CourseDetails} />
        <Stack.Screen name="ResumeCourse" component={ResumeCourse} />
        <Stack.Screen name="Edit Profile" component={EditProfile} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Privacy" component={Privacy} />
        <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        <Stack.Screen name="TwoFactor" component={TwoFactorScreen} />
        <Stack.Screen name="PhoneVerification" component={PhoneVerificationScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="QuizInstructions" component={QuizInstructions} />
        <Stack.Screen name="Help&Support" component={HelpSupport} />
        <Stack.Screen name="TakeAssessmentsMenu" component={TakeAssessmentsMenu} />
        <Stack.Screen name="AssessmentInstructions" component={AssessmentInstructions} />
        <Stack.Screen name="Assessment" component={Assessment} />
        <Stack.Screen name="Tools" component={Tools} />
        <Stack.Screen name="WebView Screen" component={WebViewScreen} />
        <Stack.Screen name="AssessmentResults" component={AssessmentResults} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

SplashScreen.preventAutoHideAsync();

function AppSplash() {
  const [appIsReady, setAppIsReady] = React.useState(false);

  React.useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={styles.splash}>
        <Image source={require('./assets/logo.jpg')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.slogan}>Empowering Digital Futures</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ThemedNavigator />
    </View>
  );
}

export default function App() {
  // Hide error overlay in development too
  React.useEffect(() => {
    if (__DEV__) {
      const originalError = console.error;
      console.error = (...args) => {
        if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('Error:')) {
          return;
        }
        originalError(...args);
      };
    }
  }, []);

  return (
    <UserProvider>
      <LanguageProvider>
        <ThemeProvider>
          <SafeAreaProvider>
            <AppSplash />
          </SafeAreaProvider>
        </ThemeProvider>
      </LanguageProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 200,
    marginBottom: 20,
  },
  slogan: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E67012',
    textAlign: 'center',
  },
});
