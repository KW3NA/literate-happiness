@echo off
echo Fixed ThemeProvider error...

echo.
echo Issues resolved:
echo 1. Added ThemeProvider to wrap the app properly
echo 2. Used ThemedNavigator function instead of duplicate navigation setup
echo 3. Added all missing screens to ThemedNavigator
echo 4. Proper provider hierarchy: UserProvider > LanguageProvider > ThemeProvider > SafeAreaProvider

echo.
echo The useTheme hook should now work in all screens!

echo.
echo To test:
echo 1. Clear Metro cache: npx expo start --clear
echo 2. Navigate to Profile screen
echo 3. Verify theme functionality works correctly

pause
