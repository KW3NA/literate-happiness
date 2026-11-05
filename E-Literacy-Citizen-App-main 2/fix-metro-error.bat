@echo off
echo Fixing Metro bundling error...
echo.

echo Installing missing expo-web-browser dependency...
npm install expo-web-browser@~14.1.4

echo.
echo Clearing Metro cache...
npx expo start --clear

echo.
echo Done! The Metro bundling error should now be fixed.
pause
