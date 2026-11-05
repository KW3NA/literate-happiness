@echo off
echo Fixing 2FA screen import issues...

echo.
echo Fixed the following issues:
echo 1. Changed import path from ../../contexts/UserContext to ../../components/UserContext
echo 2. Added proper useUser hook usage
echo 3. Added AsyncStorage import
echo 4. Fixed all require() calls to use proper imports

echo.
echo The 2FA screen should now work without import errors!

echo.
echo To test:
echo 1. Clear Metro cache: npx expo start --clear
echo 2. Login with verified email
echo 3. You should see the 2FA screen
echo 4. Check email for 6-digit code
echo 5. Enter code to complete login

pause

