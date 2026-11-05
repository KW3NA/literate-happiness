export type RootStackParamList = {
  OnboardingScreen: undefined;
  Login: undefined;
  "Home Screen": undefined;
  Profile: undefined;
  CVBuilder: undefined;
  Learn: undefined; // Added from BottomTabBar
  "Edit Profile": undefined;
  Settings: undefined;
  //ForgotPassword: undefined;
  CourseDetails: { courseId: string };
  ResumeCourse: { courseId: string };

  "Privacy": undefined; // Added Privacy Screen
  "Help&Support": undefined; // Added Help & Support Screen
  VerificationScreen: undefined;
  EmailVerification: undefined;
  TwoFactor: { email: string; user: any };
  PhoneVerification: { phoneNumber: string; countryCode: string; type: 'login' | 'registration'; name?: string; password?: string };
  Quiz: undefined; // Added Quiz Screen
  QuizInstructions: undefined; // Added Quiz Instructions Screen
  TakeAssessmentsMenu: undefined; // Added Take Assessments Menu Screen
  AssessmentInstructions: { assessment: any }; // Added Assessment Instructions Screen
  Assessment: {assessment: any}
  Tools: undefined; // Added Tools Screen
  "WebView Screen": { uri: string }; // Added WebView Screen
  AssessmentResults: { results: any }; // Added Assessment Results Screen
  Notifications: undefined; // Added Notifications Screen
  ForgotPassword: undefined;

}; 